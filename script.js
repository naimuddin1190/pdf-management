(() => {
'use strict';
const { PDFDocument, degrees, rgb, StandardFonts } = PDFLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ================= Helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let _u = 0; const uid = () => 'u' + (++_u);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const base = n => n.replace(/\.[^.]+$/, '');
const pdfBlob = bytes => new Blob([bytes], { type: 'application/pdf' });
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
const move = (arr, from, to) => { if (to < 0 || to >= arr.length) return; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); };
const norm = a => ((a % 360) + 360) % 360;
const canvasBytes = (c, type, q) => new Promise((res, rej) => c.toBlob(b => b ? b.arrayBuffer().then(x => res(new Uint8Array(x))) : rej(new Error('Canvas export failed')), type, q));
const canvasBlob = (c, type, q) => new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('Canvas export failed')), type, q));
const loadPdfLib = buf => PDFDocument.load(buf, { ignoreEncryption: true });

/* ================= Language (English / বাংলা) ================= */
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
};
let LANG = LS.get('pdfstudio-lang') === 'bn' ? 'bn' : 'en';
const BN = {
  // chrome
  'PDF Studio — Merge, Split & Edit PDFs': 'PDF Studio — PDF মার্জ, স্প্লিট ও এডিট',
  'Free · Private': 'ফ্রি · প্রাইভেট',
  'PDF Studio · Everything runs locally in your browser — your files are never uploaded.': 'PDF Studio · সবকিছু আপনার ব্রাউজারেই চলে — আপনার ফাইল কখনো আপলোড হয় না।',
  'Switch language': 'ভাষা পরিবর্তন করুন',
  'Switch to dark mode': 'নাইট মোড চালু করুন',
  'Switch to light mode': 'ডে মোড চালু করুন',
  'Merge': 'মার্জ', 'Split': 'স্প্লিট', 'Compress': 'কমপ্রেস', 'Image → PDF': 'ছবি → PDF', 'PDF → Image': 'PDF → ছবি',
  // tools
  'Merge PDF': 'PDF মার্জ', 'Combine multiple PDFs into a single file in the order you want.': 'একাধিক PDF আপনার পছন্দের ক্রমে একটি ফাইলে একত্র করুন।', 'Merge PDFs': 'PDF মার্জ করুন',
  'Split PDF': 'PDF স্প্লিট', 'Extract pages, split by ranges or break every page into its own file.': 'পেজ আলাদা করুন, রেঞ্জ অনুযায়ী ভাগ করুন বা প্রতিটি পেজ আলাদা ফাইলে নিন।',
  'Organize Pages': 'পেজ সাজান', 'Drag to reorder, rotate or delete individual pages visually.': 'টেনে ক্রম বদলান, প্রতিটি পেজ ঘোরান বা মুছে ফেলুন।', 'Save changes': 'পরিবর্তন সেভ করুন',
  'Compress PDF': 'PDF কমপ্রেস', 'Shrink file size by optimizing pages — great for email & uploads.': 'পেজ অপ্টিমাইজ করে ফাইলের সাইজ কমান — ইমেইল ও আপলোডের জন্য দারুণ।',
  'Rotate PDF': 'PDF ঘোরান', 'Rotate all pages, odd/even pages or a custom set of pages.': 'সব পেজ, বিজোড়/জোড় পেজ বা নির্দিষ্ট কিছু পেজ ঘোরান।',
  'Image to PDF': 'ছবি থেকে PDF', 'Turn JPG, PNG, WEBP and more into a clean, single PDF.': 'JPG, PNG, WEBP সহ নানা ছবিকে একটি পরিচ্ছন্ন PDF-এ রূপান্তর করুন।', 'Create PDF': 'PDF তৈরি করুন',
  'PDF to Image': 'PDF থেকে ছবি', 'Convert each page into a high-quality PNG or JPG image.': 'প্রতিটি পেজকে উচ্চমানের PNG বা JPG ছবিতে রূপান্তর করুন।', 'Convert to images': 'ছবিতে রূপান্তর করুন',
  'Add Watermark': 'ওয়াটারমার্ক যোগ', 'Stamp text over your pages — centered or tiled, any language.': 'পেজের ওপর লেখা বসান — মাঝখানে বা টাইল করে, যেকোনো ভাষায়।', 'Add watermark': 'ওয়াটারমার্ক যোগ করুন',
  'Page Numbers': 'পেজ নম্বর', 'Add page numbers with custom position, style and format.': 'পছন্দমতো অবস্থান, স্টাইল ও ফরম্যাটে পেজ নম্বর যোগ করুন।', 'Add page numbers': 'পেজ নম্বর যোগ করুন',
  'Extract Text': 'টেক্সট বের করুন', 'Pull all selectable text out of a PDF into a .txt file.': 'PDF থেকে সব সিলেক্টযোগ্য লেখা একটি .txt ফাইলে নিন।', 'Extract text': 'টেক্সট বের করুন',
  'Edit Metadata': 'মেটাডেটা এডিট', 'Change title, author, subject and keywords of a PDF.': 'PDF-এর টাইটেল, লেখক, বিষয় ও কিওয়ার্ড বদলান।', 'Save metadata': 'মেটাডেটা সেভ করুন',
  // home
  '100% private — files never leave your device': '১০০% প্রাইভেট — ফাইল আপনার ডিভাইসের বাইরে যায় না',
  'Every PDF tool,': 'সব PDF টুল,', 'beautifully simple.': 'দারুণ সহজে।',
  'Merge, split, compress, convert and edit PDFs right in your browser. Fast, free and no uploads.': 'ব্রাউজারেই PDF মার্জ, স্প্লিট, কমপ্রেস, কনভার্ট ও এডিট করুন। দ্রুত, ফ্রি এবং কোনো আপলোড ছাড়াই।',
  'Search tools… e.g. merge, compress': 'টুল খুঁজুন… যেমন: মার্জ, কমপ্রেস',
  'No tools match your search.': 'আপনার খোঁজার সাথে কোনো টুল মেলেনি।',
  'Private by design': 'শুরু থেকেই প্রাইভেট', 'Processing happens on your device with zero uploads, so sensitive documents stay yours.': 'সব প্রসেসিং আপনার ডিভাইসেই হয়, কোনো আপলোড নেই — তাই গোপন ডকুমেন্ট আপনারই থাকে।',
  'Lightning fast': 'বিদ্যুৎ গতি', 'No waiting for servers. Merge, split and convert in seconds, even offline-ready.': 'সার্ভারের জন্য অপেক্ষা নেই। সেকেন্ডেই মার্জ, স্প্লিট ও কনভার্ট — অফলাইনেও প্রস্তুত।',
  'No limits': 'কোনো সীমা নেই', 'No sign-up, no watermarks, no file caps — use every tool as often as you like.': 'সাইন-আপ নেই, ওয়াটারমার্ক নেই, ফাইলের সীমা নেই — যত খুশি ব্যবহার করুন।',
  // tool view
  'All tools': 'সব টুল', 'Options': 'অপশন', 'Processed locally in your browser': 'আপনার ব্রাউজারেই প্রসেস হয়',
  'Please choose image files (JPG, PNG, WEBP…)': 'ছবির ফাইল বেছে নিন (JPG, PNG, WEBP…)', 'Please choose a PDF file': 'একটি PDF ফাইল বেছে নিন',
  '{n} unsupported file(s) skipped': '{n}টি অসমর্থিত ফাইল বাদ দেওয়া হয়েছে',
  'Reading {name}': '{name} পড়া হচ্ছে', "Couldn't read {name}": '{name} পড়া যায়নি',
  '"{name}" is password-protected': '"{name}" পাসওয়ার্ড দিয়ে সুরক্ষিত', 'Couldn\'t open "{name}" — it may be damaged': '"{name}" খোলা যায়নি — ফাইলটি নষ্ট হতে পারে',
  'Couldn\'t read image "{name}"': '"{name}" ছবিটি পড়া যায়নি',
  'Drop your images here': 'আপনার ছবিগুলো এখানে ছাড়ুন', 'Drop your PDFs here': 'আপনার PDF গুলো এখানে ছাড়ুন', 'Drop your PDF here': 'আপনার PDF এখানে ছাড়ুন',
  'or click to browse from your device': 'অথবা ক্লিক করে ডিভাইস থেকে বেছে নিন', ' · select multiple files': ' · একাধিক ফাইল বেছে নেওয়া যাবে',
  'Choose images': 'ছবি বেছে নিন', 'Choose files': 'ফাইল বেছে নিন', 'Choose file': 'ফাইল বেছে নিন',
  '{n} image': '{n}টি ছবি', '{n} images': '{n}টি ছবি', '{n} file': '{n}টি ফাইল', '{n} files': '{n}টি ফাইল', '{n} page': '{n} পেজ', '{n} pages': '{n} পেজ', '{n} pg': '{n} পেজ',
  '{n} of {total} pages selected': '{total}টির মধ্যে {n}টি পেজ সিলেক্ট করা', 'was {n}': 'আগে ছিল {n}',
  'Add more': 'আরও যোগ করুন', 'Replace': 'বদলান', 'Clear': 'মুছুন', 'Remove': 'সরান', 'Move left': 'বাঁয়ে সরান', 'Move right': 'ডানে সরান',
  'Add images': 'ছবি যোগ করুন', 'Add PDFs': 'PDF যোগ করুন', 'Tip: drag cards to reorder, or use the arrows.': 'টিপ: কার্ড টেনে ক্রম বদলান, অথবা তীর চিহ্ন ব্যবহার করুন।',
  'Page {n}': 'পেজ {n}', 'Rotate': 'ঘোরান', 'Delete': 'মুছুন',
  'All pages removed. Click <b>Clear</b> to start again.': 'সব পেজ সরানো হয়েছে। আবার শুরু করতে <b>মুছুন</b> ক্লিক করুন।',
  'Click pages to select them, or type ranges in the options panel.': 'পেজে ক্লিক করে সিলেক্ট করুন, অথবা অপশন প্যানেলে রেঞ্জ লিখুন।',
  'Drag pages to reorder · rotate or delete with the buttons.': 'পেজ টেনে ক্রম বদলান · বাটন দিয়ে ঘোরান বা মুছুন।',
  'Selected file': 'নির্বাচিত ফাইল', 'Pages': 'পেজ', 'Size': 'সাইজ',
  'Invalid range "{part}"': 'ভুল রেঞ্জ "{part}"', '"{part}" is outside 1–{total}': '"{part}" 1–{total} সীমার বাইরে', 'Enter the pages to apply to': 'কোন পেজগুলোতে প্রয়োগ হবে তা লিখুন',
  // merge
  'Add two or more PDFs, then drag the cards into the order you want. Pages are combined from first card to last.': 'দুই বা ততোধিক PDF যোগ করুন, তারপর কার্ডগুলো পছন্দের ক্রমে টেনে সাজান। প্রথম কার্ড থেকে শেষ কার্ড পর্যন্ত পেজ একত্র হবে।',
  'Output file name': 'আউটপুট ফাইলের নাম', '.pdf is added automatically': '.pdf নিজে থেকেই যোগ হবে', 'Merging {name}': '{name} মার্জ হচ্ছে', 'Saving…': 'সেভ হচ্ছে…',
  // split
  'Selected pages are combined into one new PDF (in the order typed).': 'সিলেক্ট করা পেজগুলো একটি নতুন PDF-এ একত্র হবে (যে ক্রমে লিখেছেন)।',
  'Each range becomes its own PDF. e.g. 1-3, 4-6, 7': 'প্রতিটি রেঞ্জ আলাদা PDF হবে। যেমন: 1-3, 4-6, 7', 'Every page becomes a separate PDF.': 'প্রতিটি পেজ আলাদা PDF হবে।',
  'Split mode': 'স্প্লিট মোড', 'Extract': 'বের করুন', 'By ranges': 'রেঞ্জ অনুযায়ী', 'Every page': 'প্রতিটি পেজ', 'Pages / ranges': 'পেজ / রেঞ্জ', 'e.g. 1-3, 5, 8-10': 'যেমন: 1-3, 5, 8-10',
  'All': 'সব', 'Odd': 'বিজোড়', 'Even': 'জোড়', 'None': 'নেই', 'Custom': 'কাস্টম',
  'Multiple results can be downloaded together as a ZIP.': 'একাধিক ফলাফল একসাথে ZIP হিসেবে ডাউনলোড করা যাবে।',
  'Select some pages or type a range first': 'আগে কিছু পেজ সিলেক্ট করুন বা রেঞ্জ লিখুন', 'Creating file {i} of {n}': '{n}টির মধ্যে {i} নম্বর ফাইল তৈরি হচ্ছে',
  '{n} file created from {total} pages': '{total} পেজ থেকে {n}টি ফাইল তৈরি হয়েছে', '{n} files created from {total} pages': '{total} পেজ থেকে {n}টি ফাইল তৈরি হয়েছে',
  // organize
  'Drag pages to reorder. Use ⟳ to rotate and 🗑 to delete a page.': 'পেজ টেনে ক্রম বদলান। ঘোরাতে ⟳ আর মুছতে 🗑 ব্যবহার করুন।',
  'Rotate all': 'সব ঘোরান', 'Reverse': 'উল্টে দিন', 'Reset': 'রিসেট', 'Rebuilding document…': 'ডকুমেন্ট নতুন করে তৈরি হচ্ছে…',
  // rotate
  'Rotation': 'ঘূর্ণন', 'Apply to': 'যেখানে প্রয়োগ হবে', 'e.g. 1, 3-5': 'যেমন: 1, 3-5', '90° counter-clockwise': '90° উল্টো দিকে',
  '{n} page rotated {a}': '{n}টি পেজ {a} ঘোরানো হয়েছে', '{n} pages rotated {a}': '{n}টি পেজ {a} ঘোরানো হয়েছে',
  // compress
  'Compression level': 'কমপ্রেশন লেভেল', 'Light': 'হালকা', 'Balanced': 'মাঝারি', 'Strong': 'শক্তিশালী',
  'Light keeps the best quality; Strong gives the smallest file.': 'হালকা সেরা মান রাখে; শক্তিশালী সবচেয়ে ছোট ফাইল দেয়।', 'Convert to grayscale': 'সাদা-কালো করুন',
  'Pages are re-rendered as optimized images. Great for scans and image-heavy PDFs; text will no longer be selectable.': 'পেজগুলো অপ্টিমাইজড ছবি হিসেবে নতুন করে তৈরি হয়। স্ক্যান ও ছবি-ভরা PDF-এর জন্য দারুণ; তবে লেখা আর সিলেক্ট করা যাবে না।',
  'Compressing page {i} of {n}': '{n}টির মধ্যে {i} নম্বর পেজ কমপ্রেস হচ্ছে', '{p}% smaller': '{p}% ছোট',
  'Result is {size} — this PDF is already well optimized. Try "Strong" or grayscale.': 'ফলাফল {size} — এই PDF আগে থেকেই ভালোভাবে অপ্টিমাইজড। "শক্তিশালী" বা সাদা-কালো চেষ্টা করুন।',
  // image to pdf
  'Page size': 'পেজ সাইজ', 'Fit image': 'ছবির মাপে', 'Orientation': 'ওরিয়েন্টেশন', 'Auto': 'অটো', 'Portrait': 'খাড়া', 'Landscape': 'আড়াআড়ি',
  'Margin': 'মার্জিন', 'Small': 'ছোট', 'Large': 'বড়', 'Adding {name}': '{name} যোগ হচ্ছে',
  // pdf to image
  'Image format': 'ছবির ফরম্যাট', 'Quality': 'মান', 'Normal': 'সাধারণ', 'High': 'উচ্চ', 'Ultra': 'আল্ট্রা',
  'Higher quality = larger images (Normal ≈ 72 DPI, High ≈ 144, Ultra ≈ 216).': 'বেশি মান = বড় ছবি (সাধারণ ≈ 72 DPI, উচ্চ ≈ 144, আল্ট্রা ≈ 216)।',
  'All pages (or e.g. 1-3, 6)': 'সব পেজ (অথবা যেমন: 1-3, 6)', 'Rendering page {n}': '{n} নম্বর পেজ রেন্ডার হচ্ছে',
  '{n} image created': '{n}টি ছবি তৈরি হয়েছে', '{n} images created': '{n}টি ছবি তৈরি হয়েছে',
  // watermark
  'Watermark text': 'ওয়াটারমার্কের লেখা', 'Any language works — English, বাংলা, العربية…': 'যেকোনো ভাষা চলবে — English, বাংলা, العربية…',
  'Layout': 'লেআউট', 'Center': 'মাঝখানে', 'Tiled': 'টাইল করা', 'Font size': 'ফন্ট সাইজ', 'Opacity': 'স্বচ্ছতা', 'Color': 'রং',
  'Enter some watermark text': 'ওয়াটারমার্কের লেখা দিন', 'Stamping page {n}': '{n} নম্বর পেজে বসানো হচ্ছে',
  'Watermark added to {n} page': '{n}টি পেজে ওয়াটারমার্ক যোগ হয়েছে', 'Watermark added to {n} pages': '{n}টি পেজে ওয়াটারমার্ক যোগ হয়েছে',
  // page numbers
  'Position': 'অবস্থান', 'Format': 'ফরম্যাট', 'Start at': 'শুরু হবে', 'Skip first page (cover)': 'প্রথম পেজ বাদ দিন (কভার)', 'Cover — no number': 'কভার — নম্বর নেই',
  'Numbers added to {n} page': '{n}টি পেজে নম্বর যোগ হয়েছে', 'Numbers added to {n} pages': '{n}টি পেজে নম্বর যোগ হয়েছে',
  // extract text
  'Page separators': 'পেজ বিভাজক', 'Show': 'দেখান', 'Hide': 'লুকান',
  "Works with PDFs that contain real text. Scanned documents (images of text) won't produce output.": 'আসল লেখা আছে এমন PDF-এ কাজ করে। স্ক্যান করা ডকুমেন্টে (লেখার ছবি) কোনো আউটপুট আসবে না।',
  'Reading page {i} of {n}': '{n}টির মধ্যে {i} নম্বর পেজ পড়া হচ্ছে',
  '{c} characters from {n} page': '{n} পেজ থেকে {c}টি অক্ষর', '{c} characters from {n} pages': '{n} পেজ থেকে {c}টি অক্ষর',
  'No selectable text found — this PDF may be scanned images.': 'সিলেক্টযোগ্য কোনো লেখা পাওয়া যায়নি — এই PDF সম্ভবত স্ক্যান করা ছবি।',
  // metadata
  'Title': 'টাইটেল', 'Author': 'লেখক', 'Subject': 'বিষয়', 'Keywords': 'কিওয়ার্ড', 'Creator': 'ক্রিয়েটর', 'Producer': 'প্রডিউসার',
  'comma, separated, words': 'কমা, দিয়ে, আলাদা, শব্দ', 'Metadata updated': 'মেটাডেটা আপডেট হয়েছে',
  // run & results
  'Processing…': 'প্রসেস হচ্ছে…', 'Something went wrong': 'কিছু একটা সমস্যা হয়েছে',
  'Done! {n} files are ready': 'হয়ে গেছে! {n}টি ফাইল প্রস্তুত', 'Done! Your file is ready': 'হয়ে গেছে! আপনার ফাইল প্রস্তুত',
  'Download all (.zip)': 'সব ডাউনলোড (.zip)', 'Download {ext}': '{ext} ডাউনলোড', 'Download': 'ডাউনলোড', 'Send on WhatsApp': 'WhatsApp-এ পাঠান', 'Copy text': 'টেক্সট কপি',
  'Could not create ZIP': 'ZIP তৈরি করা যায়নি', 'Text copied to clipboard': 'টেক্সট ক্লিপবোর্ডে কপি হয়েছে', 'Press Ctrl+C to copy the selected text': 'সিলেক্ট করা লেখা কপি করতে Ctrl+C চাপুন',
  'Packing ZIP…': 'ZIP তৈরি হচ্ছে…', 'Could not prepare the file': 'ফাইল প্রস্তুত করা যায়নি', 'Shared! Pick WhatsApp from the share menu': 'শেয়ার হয়েছে! শেয়ার মেনু থেকে WhatsApp বেছে নিন',
  'Saved {name}': '{name} সেভ হয়েছে', 'Download cancelled': 'ডাউনলোড বাতিল হয়েছে', 'Please wait a moment, then try again': 'একটু অপেক্ষা করে আবার চেষ্টা করুন',
  'Download failed: {e}': 'ডাউনলোড ব্যর্থ: {e}', 'unknown error': 'অজানা ত্রুটি',
  // whatsapp modal
  'Close': 'বন্ধ করুন', 'Save the file to your device': 'ফাইলটি আপনার ডিভাইসে সেভ করুন', 'Download file': 'ফাইল ডাউনলোড',
  'Open WhatsApp and attach it': 'WhatsApp খুলে ফাইলটি যুক্ত করুন', 'Phone with country code (optional) e.g. 8801XXXXXXXXX': 'কান্ট্রি কোডসহ ফোন নম্বর (ঐচ্ছিক) যেমন: 8801XXXXXXXXX',
  '📄 Sending you "{name}"': '📄 আপনাকে "{name}" পাঠাচ্ছি', 'Open WhatsApp': 'WhatsApp খুলুন',
  "WhatsApp links can't carry files, so attach the downloaded file (📎) in the chat. On phones, the button shares the file directly.": 'WhatsApp লিংকে ফাইল পাঠানো যায় না, তাই ডাউনলোড করা ফাইলটি চ্যাটে (📎) যুক্ত করুন। ফোনে বাটনটি সরাসরি ফাইল শেয়ার করে।',
};
/** Translate an English UI string (falls back to English) and fill {placeholders}. */
const tr = (s, vars) => {
  let out = (LANG === 'bn' && BN[s]) || s;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return out;
};
/** Singular/plural helper: {n} is filled automatically. */
const trn = (n, one, many, vars) => tr(n === 1 ? one : many, { n, ...vars });

const ICONS = {
  merge: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  split: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  rotateL: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  compress: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  fileImage: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.5-1.5a2 2 0 0 0-2.8 0L9 22"/>',
  drop: '<path d="M12 2.7s-6 6.3-6 11.3a6 6 0 0 0 12 0c0-5-6-11.3-6-11.3z"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  infinity: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  swap: '<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
  resize: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  nup: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/>',
  panels: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M3 16h18"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};
const WA_SVG = (cls = 'w-5 h-5') => `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.47-9.47 9.47zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.69L.55 23.6l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z"/></svg>`;
const icon = (k, cls = 'w-5 h-5') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

/* ================= Tools catalogue ================= */
const PDF = 'application/pdf,.pdf';
const TOOLS = [
  { id: 'merge', cat: 'organize', title: 'Merge PDF', desc: 'Combine multiple PDFs into a single file in the order you want.', icon: 'merge', grad: 'from-violet-500 to-fuchsia-500', glow: 'rgba(168,85,247,.6)', accept: PDF, multiple: true, kind: 'list', action: 'Merge PDFs', min: 2 },
  { id: 'split', cat: 'organize', title: 'Split PDF', desc: 'Extract pages, split by ranges or break every page into its own file.', icon: 'split', grad: 'from-pink-500 to-rose-500', glow: 'rgba(244,63,94,.55)', accept: PDF, kind: 'pages', action: 'Split PDF' },
  { id: 'organize', cat: 'organize', title: 'Organize Pages', desc: 'Drag to reorder, rotate or delete individual pages visually.', icon: 'grid', grad: 'from-amber-400 to-orange-500', glow: 'rgba(249,115,22,.55)', accept: PDF, kind: 'pages', action: 'Save changes' },
  { id: 'sign', cat: 'edit', isNew: true, title: 'Sign PDF', desc: 'Draw, type or upload your signature and place it anywhere on the page.', icon: 'pen', grad: 'from-indigo-500 to-sky-500', glow: 'rgba(79,70,229,.55)', accept: PDF, kind: 'single', action: 'Sign & save', bigPreview: true },
  { id: 'compress', cat: 'optimize', title: 'Compress PDF', desc: 'Shrink file size by optimizing pages — great for email & uploads.', icon: 'compress', grad: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,.55)', accept: PDF, kind: 'single', action: 'Compress PDF' },
  { id: 'rotate', cat: 'organize', title: 'Rotate PDF', desc: 'Rotate all pages, odd/even pages or a custom set of pages.', icon: 'rotate', grad: 'from-sky-400 to-blue-600', glow: 'rgba(59,130,246,.55)', accept: PDF, kind: 'single', action: 'Rotate PDF' },
  { id: 'img-to-pdf', cat: 'convert', title: 'Image to PDF', desc: 'Turn JPG, PNG, WEBP and more into a clean, single PDF.', icon: 'image', grad: 'from-cyan-400 to-indigo-500', glow: 'rgba(99,102,241,.55)', accept: 'image/*', multiple: true, kind: 'list', action: 'Create PDF', isImage: true },
  { id: 'pdf-to-img', cat: 'convert', title: 'PDF to Image', desc: 'Convert each page into a high-quality PNG or JPG image.', icon: 'fileImage', grad: 'from-fuchsia-500 to-purple-600', glow: 'rgba(192,38,211,.55)', accept: PDF, kind: 'single', action: 'Convert to images' },
  { id: 'crop', cat: 'edit', isNew: true, title: 'Crop PDF', desc: 'Trim margins from pages with a live preview.', icon: 'crop', grad: 'from-rose-400 to-amber-400', glow: 'rgba(251,113,133,.55)', accept: PDF, kind: 'single', action: 'Crop pages', bigPreview: true },
  { id: 'resize', cat: 'optimize', isNew: true, title: 'Resize Pages', desc: 'Fit every page onto A4, Letter, A3 and more — no distortion.', icon: 'resize', grad: 'from-teal-400 to-cyan-600', glow: 'rgba(20,184,166,.55)', accept: PDF, kind: 'single', action: 'Resize PDF' },
  { id: 'n-up', cat: 'organize', isNew: true, title: 'Pages per Sheet', desc: 'Print 2, 4, 6 or 9 pages on a single sheet to save paper.', icon: 'nup', grad: 'from-purple-500 to-pink-500', glow: 'rgba(168,85,247,.55)', accept: PDF, kind: 'single', action: 'Create sheets' },
  { id: 'watermark', cat: 'edit', title: 'Add Watermark', desc: 'Stamp text over your pages — centered or tiled, any language.', icon: 'drop', grad: 'from-blue-500 to-violet-600', glow: 'rgba(124,58,237,.55)', accept: PDF, kind: 'single', action: 'Add watermark' },
  { id: 'page-numbers', cat: 'edit', title: 'Page Numbers', desc: 'Add page numbers with custom position, style and format.', icon: 'hash', grad: 'from-lime-400 to-emerald-500', glow: 'rgba(132,204,22,.5)', accept: PDF, kind: 'single', action: 'Add page numbers' },
  { id: 'header-footer', cat: 'edit', isNew: true, title: 'Header & Footer', desc: 'Add header and footer text with page numbers, date and file name.', icon: 'panels', grad: 'from-yellow-400 to-orange-500', glow: 'rgba(245,158,11,.55)', accept: PDF, kind: 'single', action: 'Add header & footer' },
  { id: 'extract-text', cat: 'convert', title: 'Extract Text', desc: 'Pull all selectable text out of a PDF into a .txt file.', icon: 'text', grad: 'from-orange-400 to-pink-500', glow: 'rgba(236,72,153,.5)', accept: PDF, kind: 'single', action: 'Extract text' },
  { id: 'metadata', cat: 'edit', title: 'Edit Metadata', desc: 'Change title, author, subject and keywords of a PDF.', icon: 'info', grad: 'from-slate-400 to-slate-600', glow: 'rgba(148,163,184,.45)', accept: PDF, kind: 'single', action: 'Save metadata' },
];
const CATS = [['all', 'All'], ['organize', 'Organize'], ['edit', 'Edit'], ['convert', 'Convert'], ['optimize', 'Optimize']];
const SHEETS = { a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008], a3: [841.89, 1190.55], a5: [419.53, 595.28] };

Object.assign(BN, {
  'Chat with developer': 'ডেভেলপারের সাথে চ্যাট', 'Message the developer on WhatsApp': 'WhatsApp-এ ডেভেলপারকে মেসেজ দিন',
  'Need help or have a suggestion?': 'সাহায্য লাগবে বা কোনো পরামর্শ আছে?', 'Hi! I am messaging you from PDF Studio.': 'হ্যালো! আমি PDF Studio থেকে আপনাকে মেসেজ দিচ্ছি।',
  'Organize': 'সাজানো', 'Edit': 'এডিট', 'Convert': 'কনভার্ট', 'Optimize': 'অপ্টিমাইজ', 'New': 'নতুন', 'Recently used': 'সম্প্রতি ব্যবহৃত',
  'Menu': 'মেনু', 'Shortcut: Ctrl + Enter': 'শর্টকাট: Ctrl + Enter', 'Previous page': 'আগের পেজ', 'Next page': 'পরের পেজ', 'Page {n} of {total}': 'পেজ {n} / {total}',
  'Tip: drag cards to reorder (press and hold on touch screens), or use the arrows.': 'টিপ: কার্ড টেনে ক্রম বদলান (টাচ স্ক্রিনে চেপে ধরে টানুন), অথবা তীর চিহ্ন ব্যবহার করুন।',
  'Drag pages to reorder (press and hold on touch screens) · rotate or delete with the buttons.': 'পেজ টেনে ক্রম বদলান (টাচ স্ক্রিনে চেপে ধরে টানুন) · বাটন দিয়ে ঘোরান বা মুছুন।',
  // sign
  'Sign PDF': 'PDF-এ সই', 'Draw, type or upload your signature and place it anywhere on the page.': 'সই আঁকুন, টাইপ করুন বা আপলোড করে পেজের যেকোনো জায়গায় বসান।', 'Sign & save': 'সই করে সেভ করুন',
  'Signature': 'সই', 'Draw': 'আঁকুন', 'Type': 'টাইপ', 'Upload': 'আপলোড', 'Sign with your mouse, finger or stylus': 'মাউস, আঙুল বা স্টাইলাস দিয়ে সই করুন',
  'Type your name': 'আপনার নাম লিখুন', 'Choose signature image': 'সইয়ের ছবি বেছে নিন', 'PNG or JPG — a photo of your signature works too': 'PNG বা JPG — কাগজে করা সইয়ের ছবি তুলেও দিতে পারেন',
  'Remove white background': 'সাদা ব্যাকগ্রাউন্ড সরান', 'Ink color': 'কালির রং', 'Signature size': 'সইয়ের সাইজ', 'Place on': 'যেখানে বসবে', 'This page': 'এই পেজ', 'All pages': 'সব পেজ',
  'Create your signature in the options panel': 'অপশন প্যানেলে আপনার সই তৈরি করুন', 'Create your signature first': 'আগে আপনার সই তৈরি করুন',
  'Click or drag on the page to place your signature.': 'সই বসাতে পেজে ক্লিক করুন বা টেনে আনুন।',
  'Signature added to {n} page': '{n}টি পেজে সই যোগ হয়েছে', 'Signature added to {n} pages': '{n}টি পেজে সই যোগ হয়েছে',
  // crop
  'Crop PDF': 'PDF ক্রপ', 'Trim margins from pages with a live preview.': 'লাইভ প্রিভিউ দেখে পেজের মার্জিন কেটে ফেলুন।', 'Crop pages': 'পেজ ক্রপ করুন',
  'Same margin on all sides': 'চারদিকে একই মার্জিন', 'Top': 'উপরে', 'Right': 'ডানে', 'Bottom': 'নিচে', 'Left': 'বাঁয়ে',
  'Cropping hides the outer area of each page. Use the arrows under the preview to check other pages.': 'ক্রপ করলে প্রতিটি পেজের বাইরের অংশ বাদ যায়। অন্য পেজ দেখতে প্রিভিউয়ের নিচের তীর ব্যবহার করুন।',
  '{n} page cropped': '{n}টি পেজ ক্রপ হয়েছে', '{n} pages cropped': '{n}টি পেজ ক্রপ হয়েছে',
  // resize
  'Resize Pages': 'পেজ রিসাইজ', 'Fit every page onto A4, Letter, A3 and more — no distortion.': 'প্রতিটি পেজ A4, Letter, A3 ইত্যাদি সাইজে বসান — কোনো বিকৃতি ছাড়াই।', 'Resize PDF': 'PDF রিসাইজ করুন',
  'Every page is scaled to fit the new size without distortion and centred. Links and form fields are flattened.': 'প্রতিটি পেজ বিকৃতি ছাড়াই নতুন সাইজে মানিয়ে মাঝখানে বসানো হয়। লিংক ও ফর্ম ফিল্ড সাধারণ কনটেন্টে পরিণত হয়।',
  'Resizing page {i} of {n}': '{n}টির মধ্যে {i} নম্বর পেজ রিসাইজ হচ্ছে',
  // n-up
  'Pages per Sheet': 'এক শিটে একাধিক পেজ', 'Print 2, 4, 6 or 9 pages on a single sheet to save paper.': 'কাগজ বাঁচাতে এক শিটে 2, 4, 6 বা 9টি পেজ প্রিন্ট করুন।', 'Create sheets': 'শিট তৈরি করুন',
  'Pages per sheet': 'প্রতি শিটে পেজ', 'Sheet size': 'শিটের সাইজ', 'Spacing': 'ফাঁকা জায়গা', 'Draw a border around each page': 'প্রতিটি পেজের চারপাশে বর্ডার দিন',
  '{n} sheet': '{n}টি শিট', '{n} sheets': '{n}টি শিট', 'Arranging sheet {i} of {n}': '{n}টির মধ্যে {i} নম্বর শিট সাজানো হচ্ছে',
  // header & footer
  'Header & Footer': 'হেডার ও ফুটার', 'Add header and footer text with page numbers, date and file name.': 'পেজ নম্বর, তারিখ ও ফাইলের নামসহ হেডার-ফুটার লেখা যোগ করুন।', 'Add header & footer': 'হেডার-ফুটার যোগ করুন',
  'Header text': 'হেডারের লেখা', 'Footer text': 'ফুটারের লেখা', 'Leave empty for none': 'না চাইলে খালি রাখুন', 'Alignment': 'সারিবদ্ধতা',
  'Tokens: {n} page · {total} total pages · {date} today · {file} file name': 'টোকেন: {n} পেজ নম্বর · {total} মোট পেজ · {date} আজকের তারিখ · {file} ফাইলের নাম',
  'Enter a header or footer text': 'হেডার বা ফুটারের লেখা দিন',
  'Header & footer added to {n} page': '{n}টি পেজে হেডার-ফুটার যোগ হয়েছে', 'Header & footer added to {n} pages': '{n}টি পেজে হেডার-ফুটার যোগ হয়েছে',
});

/* ================= UI primitives ================= */
const field = (label, inner, hint = '') => `<div><label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">${tr(label)}</label>${inner}${hint ? `<p class="text-xs text-slate-400 mt-1.5 leading-relaxed">${tr(hint)}</p>` : ''}</div>`;
const seg = (name, opts, val, cols) => `<div class="seg" ${cols ? `style="display:grid;grid-template-columns:repeat(${cols},1fr)"` : ''}>${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${String(v) === String(val) ? 'checked' : ''}><span>${tr(l)}</span></label>`).join('')}</div>`;
const getSeg = n => $(`input[name="${n}"]:checked`)?.value;
const slider = (id, min, max, val, unit = '', step = 1) => `<div class="flex items-center gap-3"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${unit}" class="flex-1"><span id="${id}V" class="text-sm tabular-nums w-14 text-right text-slate-600">${val}${unit}</span></div>`;

function toast(msg, type = 'info') {
  const colors = { info: 'from-violet-400 to-fuchsia-400', success: 'from-emerald-400 to-teal-400', error: 'from-rose-400 to-orange-400' };
  const el = document.createElement('div');
  el.className = 'toast glass pointer-events-auto rounded-2xl pl-3 pr-4 py-3 text-sm flex items-center gap-3 max-w-sm';
  el.innerHTML = `<span class="w-2 h-8 rounded-full bg-gradient-to-b ${colors[type] || colors.info}"></span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, type === 'error' ? 5000 : 3200);
}
function busy(on, msg, pct) {
  const b = $('#busy');
  b.classList.toggle('hidden', !on); b.classList.toggle('grid', on);
  if (msg) $('#busyMsg').textContent = msg;
  $('#busyBar').style.width = (pct == null ? (on ? 15 : 0) : Math.max(4, Math.min(100, pct * 100))) + '%';
}

/* ================= Downloads (works in hosted viewer & standalone) ================= */
let dlNS = null, dlPromise = null;
function initDl() {
  try { if (window.claude && typeof window.claude.use === 'function' && !dlPromise) dlPromise = Promise.resolve(window.claude.use('downloads')).then(ns => (dlNS = ns)).catch(() => null); } catch (e) { /* ignore */ }
}
setTimeout(initDl, 0);
async function saveFile(name, blob) {
  initDl();
  if (dlPromise && !dlNS) await Promise.race([dlPromise, sleep(6000)]);
  if (dlNS) {
    try { await dlNS.save({ filename: name, data: blob }); toast(tr('Saved {name}', { name }), 'success'); }
    catch (e) {
      const c = e && e.code;
      if (c === 'declined') toast(tr('Download cancelled'));
      else if (c === 'rate_limited') toast(tr('Please wait a moment, then try again'));
      else toast(tr('Download failed: {e}', { e: (e && e.message) || c || tr('unknown error') }), 'error');
    }
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ================= PDF rendering ================= */
async function openPdfJs(buf) { return pdfjsLib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise; }
async function renderPage(pdf, n, { width, scale, white = true } = {}) {
  const page = await pdf.getPage(n);
  const v1 = page.getViewport({ scale: 1 });
  const vp = page.getViewport({ scale: scale || width / v1.width });
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(vp.width)); c.height = Math.max(1, Math.round(vp.height));
  const ctx = c.getContext('2d');
  if (white) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  c.pw = v1.width; c.ph = v1.height;
  page.cleanup();
  return c;
}

/* ================= State & routing ================= */
let T = null, S = null;
const app = $('#app');
function freshState() { return { files: [], pages: [], selected: new Set(), urls: [], meta: null, view: 1 }; }
function disposeState() {
  if (!S) return;
  S.files.forEach(f => { try { f.pdf && f.pdf.destroy(); } catch (e) {} f.url && URL.revokeObjectURL(f.url); });
  S.urls.forEach(u => URL.revokeObjectURL(u));
}
function route() {
  disposeState(); S = freshState();
  const t = TOOLS.find(x => x.id === location.hash.slice(1));
  t ? renderTool(t) : renderHome();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
window.addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
window.addEventListener('drop', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });

const NAV = { merge: 'Merge', split: 'Split', compress: 'Compress', 'img-to-pdf': 'Image → PDF', 'pdf-to-img': 'PDF → Image' };
function renderNav() {
  $('#navLinks').innerHTML = Object.keys(NAV).map(id => `<a href="#${id}" data-nav="${id}" class="px-2.5 lg:px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition whitespace-nowrap">${tr(NAV[id])}</a>`).join('');
  // Phone / small-tablet menu: every tool, grouped by category.
  $('#mobileMenu').innerHTML = `<a href="#" class="menu-link mb-1">${icon('grid', 'w-4 h-4')} ${tr('All tools')}</a>` + CATS.slice(1).map(([k, l]) => `
    <div class="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">${tr(l)}</div>
    <div class="grid grid-cols-2 gap-1">${TOOLS.filter(t => t.cat === k).map(t => `
      <a href="#${t.id}" data-mnav="${t.id}" class="menu-link"><span class="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br ${t.grad} grid place-items-center text-white">${icon(t.icon, 'w-3.5 h-3.5')}</span><span class="leading-tight">${tr(t.title)}</span></a>`).join('')}
    </div>`).join('');
  const mb = $('#menuBtn'); mb.title = tr('Menu'); mb.setAttribute('aria-label', mb.title);
  markNav();
}
function markNav() {
  $$('[data-nav]').forEach(a => { const on = !!T && a.dataset.nav === T.id; a.classList.toggle('bg-slate-900/5', on); a.classList.toggle('text-slate-900', on); });
  $$('[data-mnav]').forEach(a => a.classList.toggle('on', !!T && a.dataset.mnav === T.id));
}
function setMenu(open) {
  $('#mobileMenu').classList.toggle('hidden', !open);
  $('#menuBtn').setAttribute('aria-expanded', String(open));
  $('#menuBtn').innerHTML = icon(open ? 'x' : 'menu', 'w-4 h-4');
}
setMenu(false);
$('#menuBtn').addEventListener('click', e => { e.stopPropagation(); setMenu($('#mobileMenu').classList.contains('hidden')); });
$('#mobileMenu').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('click', e => { if (!e.target.closest('#mobileMenu') && !e.target.closest('#menuBtn')) setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth >= 768) setMenu(false); });

/* ---------- Keyboard shortcuts ---------- */
document.addEventListener('keydown', e => {
  const a = document.activeElement, typing = a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
  if (e.key === 'Escape') setMenu(false);
  if (e.key === '/' && !typing && !T) { const s = $('#search'); if (s) { e.preventDefault(); s.focus(); } }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && T) { const b = $('#runBtn'); if (b && !b.disabled && $('#busy').classList.contains('hidden')) { e.preventDefault(); run(); } }
});

/* ---------- Recently used tools ---------- */
const getRecent = () => { try { return (JSON.parse(LS.get('pdfstudio-recent')) || []).filter(id => TOOLS.some(t => t.id === id)); } catch (e) { return []; } };
const pushRecent = id => LS.set('pdfstudio-recent', JSON.stringify([id, ...getRecent().filter(x => x !== id)].slice(0, 4)));
let homeCat = 'all';

/* ---------- Day / night mode ---------- */
const isDark = () => document.documentElement.classList.contains('dark');
function updateThemeBtn() {
  const b = $('#themeBtn'), label = tr(isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  b.innerHTML = icon(isDark() ? 'sun' : 'moon', 'w-4 h-4');
  b.title = label; b.setAttribute('aria-label', label);
}
$('#themeBtn').addEventListener('click', () => {
  const dark = !isDark();
  document.documentElement.classList.toggle('dark', dark);
  LS.set('pdfstudio-theme', dark ? 'dark' : 'light');
  updateThemeBtn();
});

/* ---------- Language switch ---------- */
function applyChrome() {
  document.documentElement.lang = LANG;
  document.title = tr('PDF Studio — Merge, Split & Edit PDFs');
  $$('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  const lb = $('#langBtn');
  lb.textContent = LANG === 'bn' ? 'English' : 'বাংলা';
  lb.title = tr('Switch language'); lb.setAttribute('aria-label', lb.title);
  // "Contact the developer" WhatsApp links (floating button + footer), with a ready-made greeting.
  const waHref = `https://wa.me/${DEV_WA}?text=${encodeURIComponent(tr('Hi! I am messaging you from PDF Studio.'))}`;
  $$('.wa-contact').forEach(a => { a.href = waHref; });
  const fab = $('#waFab'), fabLabel = tr('Message the developer on WhatsApp');
  fab.title = fabLabel; fab.setAttribute('aria-label', fabLabel);
  renderNav(); updateThemeBtn();
}
const DEV_WA = '8801833515057'; // 01833515057 in international format (Bangladesh +880)
$('#waFab .wa-ico').innerHTML = WA_SVG('w-7 h-7');
// On desktop, show the "Chat with developer" label briefly on first load so people notice it.
setTimeout(() => { const l = $('#waFab .wa-label'); l.classList.add('intro'); setTimeout(() => l.classList.remove('intro'), 4500); }, 1200);
$('#langBtn').addEventListener('click', () => {
  LANG = LANG === 'bn' ? 'en' : 'bn';
  LS.set('pdfstudio-lang', LANG);
  applyChrome();
  if (!T) return renderHome();
  // Re-draw the current tool in the new language, keeping the loaded files.
  const res = S.results;
  renderTool(T);
  const impl = IMPL[T.id];
  if (S.files.length && impl.onLoad) Promise.resolve(impl.onLoad()).catch(console.error);
  if (res) showResults(res, true);
});

/* ================= Home ================= */
function renderHome() {
  T = null;
  markNav();
  app.innerHTML = `
  <section class="relative pt-14 sm:pt-20 pb-10 sm:pb-14 text-center px-4">
    <div class="fade-in inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-violet-700">
      ${icon('shield', 'w-3.5 h-3.5 text-violet-600')} ${tr('100% private — files never leave your device')}
    </div>
    <h1 class="fade-in font-display text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-bold tracking-tight mt-7" style="animation-delay:60ms">
      ${tr('Every PDF tool,')}<br><span class="text-gradient">${tr('beautifully simple.')}</span>
    </h1>
    <p class="fade-in mt-5 text-base sm:text-lg text-slate-600/80 max-w-xl mx-auto" style="animation-delay:120ms">
      ${tr('Merge, split, compress, convert and edit PDFs right in your browser. Fast, free and no uploads.')}
    </p>
    <div class="fade-in mt-8 max-w-md mx-auto relative" style="animation-delay:180ms">
      <span class="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">${icon('search', 'w-4 h-4')}</span>
      <input id="search" type="search" enterkeyhint="search" class="inp !rounded-2xl !py-3.5 !pl-11 sm:!pr-12 glass" placeholder="${tr('Search tools… e.g. merge, compress')}">
      <kbd class="kbd hidden sm:block absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">/</kbd>
    </div>
    ${(() => { const rec = getRecent(); return rec.length ? `
    <div class="fade-in mt-4 flex flex-wrap items-center justify-center gap-2 text-xs" style="animation-delay:220ms">
      <span class="inline-flex items-center gap-1.5 text-slate-500">${icon('clock', 'w-3.5 h-3.5')} ${tr('Recently used')}:</span>
      ${rec.map(id => { const t = TOOLS.find(x => x.id === id); return `<a href="#${id}" class="recent-link"><span class="w-4 h-4 rounded-md bg-gradient-to-br ${t.grad} grid place-items-center text-white">${icon(t.icon, 'w-2.5 h-2.5')}</span>${tr(t.title)}</a>`; }).join('')}
    </div>` : ''; })()}
  </section>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
    <div id="cats" class="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 mb-5 sm:mb-7 sm:flex-wrap sm:justify-center" role="tablist">
      ${CATS.map(([k, l]) => `<button type="button" role="tab" data-cat="${k}" aria-selected="${k === homeCat}" class="chip ${k === homeCat ? 'on' : ''}">${tr(l)} <span class="opacity-60 font-medium">${k === 'all' ? TOOLS.length : TOOLS.filter(t => t.cat === k).length}</span></button>`).join('')}
    </div>
    <div id="toolGrid" class="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"></div>
    <p id="noTools" class="hidden text-center text-slate-500 py-10">${tr('No tools match your search.')}</p>
  </section>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-20 grid md:grid-cols-3 gap-4 sm:gap-5">
    ${[['shield', 'Private by design', 'Processing happens on your device with zero uploads, so sensitive documents stay yours.', 'from-violet-500 to-fuchsia-500'],
       ['zap', 'Lightning fast', 'No waiting for servers. Merge, split and convert in seconds, even offline-ready.', 'from-amber-400 to-orange-500'],
       ['infinity', 'No limits', 'No sign-up, no watermarks, no file caps — use every tool as often as you like.', 'from-emerald-400 to-teal-500']]
      .map(([ic, t, d, g], i) => `
      <div class="glass rounded-3xl p-6 fade-in" style="animation-delay:${i * 80}ms">
        <div class="icon-bubble w-11 h-11 rounded-2xl bg-gradient-to-br ${g} grid place-items-center text-white">${icon(ic)}</div>
        <h3 class="font-display font-semibold text-lg mt-4">${tr(t)}</h3>
        <p class="text-sm text-slate-500 mt-1.5 leading-relaxed">${tr(d)}</p>
      </div>`).join('')}
  </section>`;
  const grid = $('#toolGrid');
  const draw = () => {
    const q = $('#search').value.trim().toLowerCase();
    // A search looks across every category; otherwise the selected chip filters.
    const list = TOOLS.filter(t => q ? [tr(t.title), tr(t.desc), t.title, t.desc].join(' ').toLowerCase().includes(q) : (homeCat === 'all' || t.cat === homeCat));
    grid.innerHTML = list.map((t, i) => `
      <a href="#${t.id}" class="tool-card glass rounded-3xl p-5 sm:p-6 block group fade-in" style="--glow:${t.glow};animation-delay:${i * 30}ms">
        <span class="sheen"></span>
        <div class="flex items-start justify-between">
          <div class="icon-bubble w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${t.grad} grid place-items-center text-white" style="--glow:${t.glow}">${icon(t.icon, 'w-5 h-5 sm:w-6 sm:h-6')}</div>
          <span class="w-8 h-8 rounded-full grid place-items-center bg-white border border-slate-200 text-slate-500 group-hover:text-white group-hover:bg-violet-500 group-hover:-rotate-45 transition duration-300">${icon('arrowRight', 'w-4 h-4')}</span>
        </div>
        <h3 class="font-display text-lg font-semibold mt-4 sm:mt-5 flex items-center gap-2 flex-wrap">${tr(t.title)}${t.isNew ? `<span class="new-badge">${tr('New')}</span>` : ''}</h3>
        <p class="text-sm text-slate-500 mt-1.5 leading-relaxed">${tr(t.desc)}</p>
      </a>`).join('');
    $('#noTools').classList.toggle('hidden', list.length > 0);
  };
  draw();
  $('#search').addEventListener('input', draw);
  $('#cats').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    homeCat = b.dataset.cat;
    $$('[data-cat]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    if ($('#search').value) $('#search').value = '';
    draw();
  });
}

/* ================= Tool view ================= */
function renderTool(t) {
  T = t;
  markNav();
  pushRecent(t.id);
  app.innerHTML = `
  <section class="max-w-7xl mx-auto px-3 sm:px-6 pt-7 sm:pt-9 pb-20">
    <a href="#" class="fade-in inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">${icon('arrowLeft', 'w-4 h-4')} ${tr('All tools')}</a>
    <div class="fade-in flex items-center gap-3 sm:gap-4 mt-4 sm:mt-5 mb-5 sm:mb-7" style="animation-delay:50ms">
      <div class="icon-bubble w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-gradient-to-br ${t.grad} grid place-items-center text-white" style="--glow:${t.glow}">${icon(t.icon, 'w-6 h-6 sm:w-7 sm:h-7')}</div>
      <div class="min-w-0"><h1 class="font-display text-xl min-[400px]:text-2xl sm:text-3xl font-bold tracking-tight">${tr(t.title)}</h1><p class="text-slate-500 text-sm sm:text-base">${tr(t.desc)}</p></div>
    </div>
    <div class="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4 sm:gap-5 items-start">
      <div id="work" class="glass rounded-3xl p-3 sm:p-6 min-h-[280px] sm:min-h-[440px] min-w-0 transition fade-in" style="animation-delay:100ms"></div>
      <aside class="glass rounded-3xl p-5 sm:p-6 lg:sticky lg:top-24 fade-in" style="animation-delay:150ms">
        <h2 class="font-display font-semibold text-lg mb-5 flex items-center gap-2">${icon('sliders', 'w-4 h-4 text-violet-600')} ${tr('Options')}</h2>
        <div id="opts" class="space-y-5"></div>
        <button id="runBtn" class="btn-primary w-full mt-6" title="${tr('Shortcut: Ctrl + Enter')}" disabled>${tr(t.action)} ${icon('arrowRight', 'w-4 h-4')}</button>
        <p class="text-[11px] text-slate-400 mt-3 text-center flex items-center justify-center gap-1.5">${icon('shield', 'w-3 h-3')} ${tr('Processed locally in your browser')}</p>
      </aside>
    </div>
    <div id="results" class="mt-5"></div>
  </section>
  <input type="file" id="fileInput" class="hidden" accept="${t.accept}" ${t.multiple ? 'multiple' : ''}>`;

  const impl = IMPL[t.id];
  $('#opts').innerHTML = impl.opts ? impl.opts() : '';
  impl.bind && impl.bind();
  const opts = $('#opts');
  const onOpt = e => {
    if (e.target.type === 'range') { const v = $('#' + e.target.id + 'V'); if (v) v.textContent = e.target.value + (e.target.dataset.unit || ''); }
    impl.onOpt && impl.onOpt(e);
  };
  opts.addEventListener('input', onOpt); opts.addEventListener('change', onOpt);

  const fi = $('#fileInput');
  fi.addEventListener('change', () => { addFiles([...fi.files]); fi.value = ''; });

  const w = $('#work');
  const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
  ['dragenter', 'dragover'].forEach(ev => w.addEventListener(ev, e => { if (!hasFiles(e)) return; e.preventDefault(); w.classList.add('drag-on'); }));
  w.addEventListener('dragleave', e => { if (!w.contains(e.relatedTarget)) w.classList.remove('drag-on'); });
  w.addEventListener('drop', e => { w.classList.remove('drag-on'); if (!hasFiles(e)) return; e.preventDefault(); addFiles([...e.dataTransfer.files]); });
  w.addEventListener('click', onWorkClick);

  $('#runBtn').addEventListener('click', run);
  $('#results').addEventListener('click', onResultsClick);
  renderWork();
}

function onWorkClick(e) {
  const b = e.target.closest('[data-act],[data-rm],[data-mv],[data-rot],[data-del],[data-pg],[data-pnav]');
  if (!b) return;
  const d = b.dataset;
  if (d.pnav) { S.view = Math.min(S.files[0].pageCount, Math.max(1, (S.view || 1) + +d.pnav)); return showView(); }
  if (d.act === 'add' || d.act === 'browse') return $('#fileInput').click();
  if (d.act === 'clear') return clearFiles();
  if (d.rm != null) { const [f] = S.files.splice(+d.rm, 1); f.url && URL.revokeObjectURL(f.url); try { f.pdf && f.pdf.destroy(); } catch (er) {} return renderWork(); }
  if (d.mv) { const [i, dir] = d.mv.split(',').map(Number); move(S.files, i, i + dir); return renderWork(); }
  if (d.rot != null) {
    const p = S.pages[+d.rot]; p.rot += 90;
    const img = b.closest('[data-pid]').querySelector('img');
    img.style.transform = `rotate(${p.rot}deg) scale(${norm(p.rot) % 180 ? .74 : 1})`;
    return;
  }
  if (d.del != null) { S.pages.splice(+d.del, 1); return renderWork(); }
  if (d.pg != null) {
    const src = +d.pg;
    S.selected.has(src) ? S.selected.delete(src) : S.selected.add(src);
    b.classList.toggle('selected', S.selected.has(src));
    const r = $('#ranges'); if (r) { r.value = toRanges(S.selected); r.classList.remove('bad'); }
    updateSummary();
  }
}

function clearFiles() {
  disposeState(); const keepMeta = S.meta; S = freshState(); S.meta = keepMeta;
  $('#results').innerHTML = '';
  renderWork();
}

async function addFiles(files) {
  const img = !!T.isImage;
  const ok = files.filter(f => img ? f.type.startsWith('image/') : (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)));
  if (!ok.length) return toast(tr(img ? 'Please choose image files (JPG, PNG, WEBP…)' : 'Please choose a PDF file'), 'error');
  if (ok.length < files.length) toast(tr('{n} unsupported file(s) skipped', { n: files.length - ok.length }));
  const list = T.multiple ? ok : [ok[0]];
  if (!T.multiple) { disposeState(); S = freshState(); }
  $('#results').innerHTML = '';
  const st = S;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    busy(true, tr('Reading {name}', { name: f.name }), i / list.length);
    try { const entry = img ? await loadImage(f) : await loadPdf(f); if (S !== st) return; S.files.push(entry); }
    catch (e) { console.error(e); toast(e.message || tr("Couldn't read {name}", { name: f.name }), 'error'); }
  }
  busy(false);
  if (!S.files.length) return renderWork();
  if (T.kind === 'pages') preparePages();
  renderWork();
  const impl = IMPL[T.id];
  if (impl.onLoad) { try { await impl.onLoad(); } catch (e) { console.error(e); } }
}

async function loadPdf(f) {
  const buf = await f.arrayBuffer();
  let pdf;
  try { pdf = await openPdfJs(buf); }
  catch (e) { throw new Error(e && e.name === 'PasswordException' ? tr('"{name}" is password-protected', { name: f.name }) : tr(`Couldn't open "{name}" — it may be damaged`, { name: f.name })); }
  const c = await renderPage(pdf, 1, { width: 280 });
  const entry = { id: uid(), name: f.name, size: f.size, buf, pageCount: pdf.numPages, thumb: c.toDataURL('image/jpeg', .82), pw: c.pw, ph: c.ph, pdf };
  if (T.kind === 'list') { pdf.destroy(); entry.pdf = null; }
  return entry;
}
function loadImage(f) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => res({ id: uid(), file: f, name: f.name, size: f.size, type: f.type, url, thumb: url, w: im.naturalWidth, h: im.naturalHeight, el: im });
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error(tr(`Couldn't read image "{name}"`, { name: f.name }))); };
    im.src = url;
  });
}

function preparePages() {
  const f = S.files[0];
  S.pages = Array.from({ length: f.pageCount }, (_, i) => ({ id: uid(), src: i, rot: 0, thumb: i === 0 ? f.thumb : null }));
  S.selected = new Set();
  const st = S;
  (async () => {
    for (const p of st.pages) {
      if (S !== st) return;
      if (p.thumb) continue;
      try {
        const c = await renderPage(f.pdf, p.src + 1, { width: 220 });
        p.thumb = c.toDataURL('image/jpeg', .75);
        const img = $(`[data-pid="${p.id}"] img`);
        if (img) { img.src = p.thumb; img.classList.remove('opacity-0'); const sp = img.parentElement.querySelector('.animate-spin'); if (sp) sp.parentElement.remove(); }
      } catch (e) { console.warn(e); }
    }
  })();
}

/* ---------- Workspace renderers ---------- */
function dropzoneHTML() {
  const img = !!T.isImage, many = !!T.multiple;
  return `
  <button data-act="browse" class="dropzone w-full min-h-[256px] sm:min-h-[400px] rounded-2xl flex flex-col items-center justify-center text-center p-5 sm:p-8 group">
    <div class="relative">
      <div class="absolute -inset-4 blur-2xl bg-gradient-to-br ${T.grad} opacity-40 rounded-full group-hover:opacity-70 transition duration-500"></div>
      <div class="relative icon-bubble w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${T.grad} grid place-items-center text-white float-y" style="--glow:${T.glow}">${icon('upload', 'w-7 h-7 sm:w-9 sm:h-9')}</div>
    </div>
    <h3 class="font-display text-lg min-[400px]:text-xl sm:text-2xl font-semibold mt-6 sm:mt-8">${tr(img ? 'Drop your images here' : many ? 'Drop your PDFs here' : 'Drop your PDF here')}</h3>
    <p class="text-slate-500 mt-2 text-sm">${tr('or click to browse from your device')}${many ? tr(' · select multiple files') : ''}</p>
    <span class="btn-primary mt-6 sm:mt-7 pointer-events-none">${icon('plus', 'w-4 h-4')} ${tr(img ? 'Choose images' : many ? 'Choose files' : 'Choose file')}</span>
  </button>`;
}
function summaryText() {
  const f = S.files, b = n => `<b class="text-slate-900">${n}</b>`;
  if (T.kind === 'list') {
    const pages = T.isImage ? '' : ` · ${trn(f.reduce((a, x) => a + x.pageCount, 0), '{n} page', '{n} pages')}`;
    return `${trn(f.length, T.isImage ? '{n} image' : '{n} file', T.isImage ? '{n} images' : '{n} files', { n: b(f.length) })}${pages} · ${fmt(f.reduce((a, x) => a + x.size, 0))}`;
  }
  if (T.id === 'split') return tr('{n} of {total} pages selected', { n: b(S.selected.size), total: S.pages.length });
  if (T.id === 'organize') return `${trn(S.pages.length, '{n} page', '{n} pages', { n: b(S.pages.length) })}${S.pages.length !== f[0].pageCount ? ` <span class="text-slate-400">(${tr('was {n}', { n: f[0].pageCount })})</span>` : ''}`;
  return `<span class="truncate">${esc(f[0].name)}</span>`;
}
function updateSummary() { const s = $('#summary'); if (s) s.innerHTML = summaryText(); }
function updateRun() {
  const min = T.min || 1;
  $('#runBtn').disabled = S.files.length < min || (T.kind === 'pages' && !S.pages.length);
}

function renderWork() {
  const w = $('#work');
  if (!S.files.length) { w.innerHTML = dropzoneHTML(); updateRun(); return; }
  const toolbar = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
      <div id="summary" class="text-sm text-slate-600 min-w-0">${summaryText()}</div>
      <div class="flex gap-2">
        <button data-act="add" class="btn-ghost">${icon(T.multiple ? 'plus' : 'swap', 'w-4 h-4')} ${tr(T.multiple ? 'Add more' : 'Replace')}</button>
        <button data-act="clear" class="btn-ghost hover:!text-rose-600 hover:!border-rose-200">${icon('x', 'w-4 h-4')} ${tr('Clear')}</button>
      </div>
    </div>`;
  let body = '';
  if (T.kind === 'list') body = listHTML();
  else if (T.kind === 'pages') body = pagesHTML();
  else body = singleHTML();
  w.innerHTML = toolbar + body;
  if (T.kind === 'list') sortable($('#sortGrid'), S.files);
  if (T.id === 'organize') sortable($('#sortGrid'), S.pages);
  if (T.id === 'split') { const r = $('#ranges'); if (r && document.activeElement !== r) r.value = toRanges(S.selected); }
  IMPL[T.id].afterRender && IMPL[T.id].afterRender();
  if (T.bigPreview && S.files.length) showView();
  updateRun();
}

/* Render page S.view of the loaded PDF into the large preview (cached per page). */
async function showView() {
  const f = S.files[0], im = $('#thumbImg'); if (!f || !im || !f.pdf) return;
  const n = S.view || 1, st = S, lbl = $('#pvLabel');
  if (lbl) lbl.textContent = tr('Page {n} of {total}', { n, total: f.pageCount });
  $$('[data-pnav]').forEach(b => { const dir = +b.dataset.pnav; b.disabled = dir < 0 ? n <= 1 : n >= f.pageCount; b.classList.toggle('opacity-40', b.disabled); });
  try {
    f.views = f.views || {};
    if (!f.views[n]) {
      const c = await renderPage(f.pdf, n, { width: 760 });
      f.views[n] = { url: c.toDataURL('image/jpeg', .86), pw: c.pw, ph: c.ph };
      c.width = c.height = 0;
    }
    if (S !== st || (S.view || 1) !== n || !$('#thumbImg')) return;
    $('#thumbImg').src = f.views[n].url;
    const impl = IMPL[T.id]; impl.onOpt && impl.onOpt({ target: {} });
  } catch (e) { console.warn(e); }
}

function listHTML() {
  const n = S.files.length;
  return `<div id="sortGrid" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
    ${S.files.map((f, i) => `
      <div data-idx="${i}" class="item-card glass-soft rounded-2xl p-2.5 cursor-grab active:cursor-grabbing select-none">
        <div class="relative aspect-[3/4] rounded-xl bg-slate-100/80 overflow-hidden grid place-items-center">
          <img src="${f.thumb}" draggable="false" class="max-w-[88%] max-h-[88%] object-contain rounded shadow-[0_6px_20px_rgba(15,23,42,.18)]">
          <span class="absolute top-2 left-2 min-w-[26px] h-[26px] px-1.5 rounded-lg bg-white/90 backdrop-blur text-slate-700 shadow-sm text-xs font-semibold grid place-items-center border border-slate-200">${i + 1}</span>
          <button data-rm="${i}" class="absolute top-2 right-2 mini-btn !bg-white/90 !text-slate-600 hover:!bg-rose-500 hover:!text-white" title="${tr('Remove')}">${icon('x', 'w-3.5 h-3.5')}</button>
        </div>
        <div class="px-1 pt-2.5 pb-0.5">
          <p class="text-[13px] font-medium truncate" title="${esc(f.name)}">${esc(f.name)}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-[11px] text-slate-500">${T.isImage ? `${f.w}×${f.h}` : tr('{n} pg', { n: f.pageCount })} · ${fmt(f.size)}</span>
            <span class="flex gap-1">
              <button data-mv="${i},-1" class="mini-btn !w-6 !h-6 ${i === 0 ? 'opacity-30 pointer-events-none' : ''}" title="${tr('Move left')}">${icon('chevL', 'w-3.5 h-3.5')}</button>
              <button data-mv="${i},1" class="mini-btn !w-6 !h-6 ${i === n - 1 ? 'opacity-30 pointer-events-none' : ''}" title="${tr('Move right')}">${icon('chevR', 'w-3.5 h-3.5')}</button>
            </span>
          </div>
        </div>
      </div>`).join('')}
      <button data-act="add" class="rounded-2xl border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 transition grid place-items-center min-h-[200px] text-slate-500 hover:text-slate-900">
        <span class="flex flex-col items-center gap-2 text-sm">${icon('plus', 'w-7 h-7')} ${tr(T.isImage ? 'Add images' : 'Add PDFs')}</span>
      </button>
  </div>
  <p class="text-xs text-slate-400 mt-4 px-1">${tr('Tip: drag cards to reorder (press and hold on touch screens), or use the arrows.')}</p>`;
}

function pagesHTML() {
  const sel = T.id === 'split';
  return `<div id="sortGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    ${S.pages.map((p, i) => `
      <div data-idx="${i}" data-pid="${p.id}" ${sel ? `data-pg="${p.src}"` : ''} class="item-card glass-soft rounded-2xl p-2 select-none ${sel ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${sel && S.selected.has(p.src) ? 'selected' : ''}">
        <div class="thumb-wrap relative aspect-[3/4] rounded-xl bg-slate-100/80 overflow-hidden grid place-items-center">
          <img src="${p.thumb || BLANK}" draggable="false" class="max-w-[88%] max-h-[88%] object-contain rounded-sm shadow-[0_6px_18px_rgba(15,23,42,.18)] ${p.thumb ? '' : 'opacity-0'}" style="transform:rotate(${p.rot}deg) scale(${norm(p.rot) % 180 ? .74 : 1})">
          ${p.thumb ? '' : '<div class="absolute inset-0 grid place-items-center"><div class="w-6 h-6 rounded-full border-2 border-slate-200 border-t-violet-500 animate-spin"></div></div>'}
        </div>
        <div class="flex items-center justify-between mt-2 px-1 h-7">
          <span class="text-xs text-slate-500 font-medium">${sel ? tr('Page {n}', { n: p.src + 1 }) : (i + 1) + (p.src !== i ? ` <span class="text-slate-400">(${p.src + 1})</span>` : '')}</span>
          ${sel ? `<span class="check">${icon('check', 'w-3 h-3')}</span>` :
            `<span class="flex gap-1"><button data-rot="${i}" class="mini-btn" title="${tr('Rotate')}">${icon('rotate', 'w-3.5 h-3.5')}</button><button data-del="${i}" class="mini-btn hover:!bg-rose-500 hover:!text-white" title="${tr('Delete')}">${icon('trash', 'w-3.5 h-3.5')}</button></span>`}
        </div>
      </div>`).join('')}
  </div>
  ${!S.pages.length ? `<p class="text-center text-slate-500 py-16">${tr('All pages removed. Click <b>Clear</b> to start again.')}</p>` : ''}
  <p class="text-xs text-slate-400 mt-4 px-1">${tr(sel ? 'Click pages to select them, or type ranges in the options panel.' : 'Drag pages to reorder (press and hold on touch screens) · rotate or delete with the buttons.')}</p>`;
}

function singleHTML() {
  const f = S.files[0];
  if (T.bigPreview) return `
  <div class="flex flex-col items-center gap-3">
    <p class="text-sm text-slate-500 text-center px-2 break-all">${trn(f.pageCount, '{n} page', '{n} pages')} · ${fmt(f.size)}</p>
    <div class="p-2 sm:p-3 rounded-3xl glass-soft w-full max-w-[480px]">
      <div class="relative w-full rounded-lg overflow-hidden ring-1 ring-slate-200 bg-white shadow-[0_20px_45px_-15px_rgba(15,23,42,.35)]">
        <img id="thumbImg" src="${(f.views && f.views[S.view || 1]?.url) || f.thumb}" draggable="false" class="block w-full h-auto select-none">
        <div id="ov" class="absolute inset-0 overflow-hidden ${T.id === 'sign' ? 'cursor-crosshair touch-none' : 'pointer-events-none'}"></div>
      </div>
    </div>
    ${f.pageCount > 1 ? `<div class="flex items-center gap-2">
      <button data-pnav="-1" class="mini-btn !w-10 !h-10 !rounded-xl" title="${tr('Previous page')}" aria-label="${tr('Previous page')}">${icon('chevL', 'w-4 h-4')}</button>
      <span id="pvLabel" class="text-sm font-medium tabular-nums min-w-[7.5rem] text-center text-slate-600">${tr('Page {n} of {total}', { n: S.view || 1, total: f.pageCount })}</span>
      <button data-pnav="1" class="mini-btn !w-10 !h-10 !rounded-xl" title="${tr('Next page')}" aria-label="${tr('Next page')}">${icon('chevR', 'w-4 h-4')}</button>
    </div>` : ''}
    ${T.id === 'sign' ? `<p class="text-xs text-slate-400 text-center px-2">${tr('Click or drag on the page to place your signature.')}</p>` : ''}
  </div>`;
  return `
  <div class="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start p-1 sm:p-2">
    <div class="shrink-0 p-3 rounded-3xl glass-soft">
      <div class="relative w-48 sm:w-52 rounded-lg overflow-hidden shadow-[0_20px_45px_-15px_rgba(15,23,42,.35)] ring-1 ring-slate-200">
        <img id="thumbImg" src="${f.thumb}" class="block w-full h-auto transition-transform duration-500">
        <div id="ov" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
      </div>
    </div>
    <div class="flex-1 min-w-0 w-full">
      <div class="text-[11px] uppercase tracking-wider text-violet-600 font-semibold">${tr('Selected file')}</div>
      <h3 class="font-display text-xl font-semibold mt-1 break-all">${esc(f.name)}</h3>
      <div class="grid grid-cols-2 gap-3 mt-5 max-w-sm">
        <div class="glass-soft rounded-2xl p-4"><div class="text-[11px] text-slate-500 uppercase tracking-wider">${tr('Pages')}</div><div class="font-display text-2xl font-semibold mt-1">${f.pageCount}</div></div>
        <div class="glass-soft rounded-2xl p-4"><div class="text-[11px] text-slate-500 uppercase tracking-wider">${tr('Size')}</div><div class="font-display text-2xl font-semibold mt-1">${fmt(f.size)}</div></div>
      </div>
      <div id="extra" class="mt-5"></div>
    </div>
  </div>`;
}

/* ---------- Drag & drop sorting ---------- */
// Pointer-based sorting: works with mouse, pen and touch (press & hold ~0.3s on touch, so normal scrolling still works).
function sortable(container, arr) {
  if (!container) return;
  container.addEventListener('contextmenu', e => { if (e.target.closest('[data-idx]')) e.preventDefault(); });
  container.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-idx]');
    if (!el || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const from = +el.dataset.idx, x0 = e.clientX, y0 = e.clientY, touch = e.pointerType !== 'mouse';
    let on = false, over = null, timer = null;
    const begin = () => { on = true; el.classList.add('dragging'); if (touch && navigator.vibrate) { try { navigator.vibrate(12); } catch (er) {} } };
    const mv = ev => {
      if (ev.pointerId !== e.pointerId) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!on) {
        if (touch) { if (Math.hypot(dx, dy) > 10) cleanup(); return; } // finger moved early → it's a scroll
        if (Math.hypot(dx, dy) < 6) return;
        begin();
      }
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      const hit = document.elementFromPoint(ev.clientX, ev.clientY);
      const t = hit && hit.closest('[data-idx]'), tgt = t && t !== el && container.contains(t) ? t : null;
      if (tgt !== over) { over && over.classList.remove('drop-target'); over = tgt; over && over.classList.add('drop-target'); }
    };
    const blockScroll = ev => { if (on) ev.preventDefault(); };
    const up = () => {
      const to = over ? +over.dataset.idx : null, moved = on;
      cleanup();
      if (moved && to !== null && to !== from) { move(arr, from, to); renderWork(); }
    };
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      document.removeEventListener('touchmove', blockScroll);
      el.classList.remove('dragging'); el.style.transform = '';
      over && over.classList.remove('drop-target');
    }
    if (touch) timer = setTimeout(begin, 300);
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    document.addEventListener('touchmove', blockScroll, { passive: false });
  });
}

/* ---------- Page ranges ---------- */
function parseRanges(str, total) {
  const groups = [];
  for (const part of str.split(/[,;]+/).map(s => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*(?:(-)\s*(\d+)?)?$/);
    if (!m) throw new Error(tr('Invalid range "{part}"', { part }));
    const a = +m[1], b = m[3] ? +m[3] : (m[2] ? total : a);
    if (a < 1 || b < 1 || a > total || b > total) throw new Error(tr('"{part}" is outside 1–{total}', { part, total }));
    const g = [];
    if (a <= b) for (let i = a; i <= b; i++) g.push(i - 1); else for (let i = a; i >= b; i--) g.push(i - 1);
    groups.push(g);
  }
  return groups;
}
function toRanges(set) {
  const s = [...set].sort((a, b) => a - b), out = [];
  for (let i = 0; i < s.length; i++) {
    let j = i; while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    out.push(j > i ? `${s[i] + 1}-${s[j] + 1}` : `${s[i] + 1}`); i = j;
  }
  return out.join(', ');
}
function pageTargets(mode, input, total) {
  if (mode === 'odd') return new Set([...Array(total).keys()].filter(i => i % 2 === 0));
  if (mode === 'even') return new Set([...Array(total).keys()].filter(i => i % 2 === 1));
  if (mode === 'custom') { const g = parseRanges(input || '', total).flat(); if (!g.length) throw new Error(tr('Enter the pages to apply to')); return new Set(g); }
  return new Set([...Array(total).keys()]);
}

/* ---------- Text image (any language) ---------- */
async function textCanvas(text, px, color, weight = 700) {
  const fam = `Inter, "Hind Siliguri", "Noto Sans", sans-serif`;
  try { await document.fonts.load(`${weight} ${px}px "Hind Siliguri"`, text); await document.fonts.load(`${weight} ${px}px Inter`, text); } catch (e) {}
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  ctx.font = `${weight} ${px}px ${fam}`;
  const w = Math.ceil(ctx.measureText(text).width + px * .4), h = Math.ceil(px * 1.45);
  c.width = w; c.height = h;
  ctx.font = `${weight} ${px}px ${fam}`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  return c;
}
function measure(text, px) { const ctx = measure.ctx || (measure.ctx = document.createElement('canvas').getContext('2d')); ctx.font = `700 ${px}px Inter, "Hind Siliguri", sans-serif`; return ctx.measureText(text).width + px * .4; }
function tileCenters(pw, ph, w, h, size) {
  const sx = w + size * 2.2, sy = h + size * 2.8, pts = [];
  let row = 0;
  for (let y = -ph * .4; y < ph * 1.4; y += sy, row++)
    for (let x = -pw * .4 + (row % 2 ? sx / 2 : 0); x < pw * 1.4; x += sx) pts.push([x, y]);
  return pts;
}

/* ---------- Page geometry (handles /Rotate and CropBox) ---------- */
// "Visual" space = the page as a viewer shows it (after rotation), origin bottom-left.
function visualFrame(page) {
  const b = page.getCropBox(), r = norm(page.getRotation().angle), W = b.width, H = b.height;
  const map = (vx, vy) => {
    const [x, y] = r === 90 ? [W - vy, vx] : r === 180 ? [W - vx, H - vy] : r === 270 ? [vy, H - vx] : [vx, vy];
    return [b.x + x, b.y + y];
  };
  return { VW: r % 180 ? H : W, VH: r % 180 ? W : H, r, map };
}
// Draw an image upright (as seen in viewers) centred on visual point (cx, cy).
function drawUpright(page, fr, img, cx, cy, w, h) {
  const [ux, uy] = fr.map(cx, cy), t = fr.r * Math.PI / 180, cos = Math.cos(t), sin = Math.sin(t);
  page.drawImage(img, { x: ux - (w / 2) * cos + (h / 2) * sin, y: uy - (w / 2) * sin - (h / 2) * cos, width: w, height: h, rotate: degrees(fr.r) });
}
// Embed every page of a PDF into a new document as reusable XObjects (for resize / n-up).
async function embedAll(f) {
  const src = await loadPdfLib(f.buf), out = await PDFDocument.create(), pages = src.getPages(), items = [];
  for (let i = 0; i < pages.length; i++) {
    if (i % 10 === 0) busy(true, tr('Reading page {i} of {n}', { i: i + 1, n: pages.length }), i / pages.length * .5);
    const p = pages[i], b = p.getCropBox(), r = norm(p.getRotation().angle);
    let emb = null;
    try { emb = await out.embedPage(p, { left: b.x, bottom: b.y, right: b.x + b.width, top: b.y + b.height }); }
    catch (e) { console.warn('Page ' + (i + 1) + ' could not be embedded (probably blank)', e); }
    items.push({ emb, r, vw: r % 180 ? b.height : b.width, vh: r % 180 ? b.width : b.height });
  }
  return { out, items };
}
// Draw an embedded page so it looks the way viewers show it, scaled by s, with its visual bottom-left at (ox, oy).
function drawEmbedded(page, emb, ox, oy, s, r) {
  if (!emb) return;
  const W = emb.width * s, H = emb.height * s;
  const [x, y] = { 0: [ox, oy], 90: [ox, oy + W], 180: [ox + W, oy + H], 270: [ox + H, oy] }[norm(r)];
  page.drawPage(emb, { x, y, xScale: s, yScale: s, rotate: degrees(-norm(r)) });
}
// Crop a canvas to its non-transparent pixels.
function trimCanvas(c, pad = 6) {
  const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1 + pad * 2; out.height = y1 - y0 + 1 + pad * 2;
  out.getContext('2d').drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1);
  return out;
}

/* ================= Tool implementations ================= */
const IMPL = {
  merge: {
    opts: () => `<div class="info">${tr('Add two or more PDFs, then drag the cards into the order you want. Pages are combined from first card to last.')}</div>
      ${field('Output file name', `<input id="outName" class="inp" value="merged">`, '.pdf is added automatically')}`,
    async run() {
      const out = await PDFDocument.create();
      for (let i = 0; i < S.files.length; i++) {
        const f = S.files[i]; busy(true, tr('Merging {name}', { name: f.name }), i / S.files.length);
        const src = await loadPdfLib(f.buf);
        (await out.copyPages(src, src.getPageIndices())).forEach(p => out.addPage(p));
      }
      busy(true, tr('Saving…'), .98);
      const bytes = await out.save();
      const name = (($('#outName').value || 'merged').trim().replace(/\.pdf$/i, '') || 'merged') + '.pdf';
      return { files: [{ name, blob: pdfBlob(bytes) }], note: `${trn(S.files.length, '{n} file', '{n} files')} · ${trn(out.getPageCount(), '{n} page', '{n} pages')} · ${fmt(bytes.length)}` };
    }
  },

  split: {
    hints: { extract: 'Selected pages are combined into one new PDF (in the order typed).', ranges: 'Each range becomes its own PDF. e.g. 1-3, 4-6, 7', each: 'Every page becomes a separate PDF.' },
    opts() {
      return `${field('Split mode', seg('mode', [['extract', 'Extract'], ['ranges', 'By ranges'], ['each', 'Every page']], 'extract'))}
      <div id="rangeBox">${field('Pages / ranges', `<input id="ranges" class="inp" placeholder="${tr('e.g. 1-3, 5, 8-10')}">`, `<span id="rangeHint">${tr(this.hints.extract)}</span>`)}
        <div class="grid grid-cols-4 gap-2 mt-3">${[['all', 'All'], ['odd', 'Odd'], ['even', 'Even'], ['none', 'None']].map(([k, l]) => `<button data-sel="${k}" class="btn-ghost !px-2 !text-xs">${tr(l)}</button>`).join('')}</div>
      </div>
      <p id="eachHint" class="info hidden">${tr(this.hints.each)} ${tr('Multiple results can be downloaded together as a ZIP.')}</p>`;
    },
    bind() {
      $('#opts').addEventListener('click', e => {
        const b = e.target.closest('[data-sel]'); if (!b || !S.pages.length) return;
        const n = S.files[0].pageCount, k = b.dataset.sel;
        S.selected = new Set([...Array(n).keys()].filter(i => k === 'all' || (k === 'odd' && i % 2 === 0) || (k === 'even' && i % 2 === 1)));
        this.syncSel(); $('#ranges').value = toRanges(S.selected); $('#ranges').classList.remove('bad');
      });
    },
    syncSel() { $$('[data-pg]').forEach(el => el.classList.toggle('selected', S.selected.has(+el.dataset.pg))); updateSummary(); },
    onOpt(e) {
      const mode = getSeg('mode');
      $('#rangeBox').classList.toggle('hidden', mode === 'each');
      $('#eachHint').classList.toggle('hidden', mode !== 'each');
      $('#rangeHint').textContent = tr(this.hints[mode] || '');
      if (e.target.id === 'ranges' && S.files.length) {
        try { S.selected = new Set(parseRanges(e.target.value, S.files[0].pageCount).flat()); e.target.classList.remove('bad'); this.syncSel(); }
        catch (er) { e.target.classList.add('bad'); }
      }
    },
    async run() {
      const f = S.files[0], total = f.pageCount, mode = getSeg('mode'), nm = base(f.name);
      let groups;
      if (mode === 'each') groups = [...Array(total).keys()].map(i => [i]);
      else {
        const txt = $('#ranges').value.trim() || toRanges(S.selected);
        groups = parseRanges(txt, total);
        if (!groups.length) throw new Error(tr('Select some pages or type a range first'));
        if (mode === 'extract') groups = [groups.flat()];
      }
      const src = await loadPdfLib(f.buf), files = [];
      for (let i = 0; i < groups.length; i++) {
        busy(true, tr('Creating file {i} of {n}', { i: i + 1, n: groups.length }), i / groups.length);
        const g = groups[i], out = await PDFDocument.create();
        (await out.copyPages(src, g)).forEach(p => out.addPage(p));
        const label = g.length === 1 ? `page-${g[0] + 1}` : (mode === 'extract' ? 'extracted' : `pages-${g[0] + 1}-${g[g.length - 1] + 1}`);
        const bytes = await out.save();
        files.push({ name: `${nm}_${label}.pdf`, blob: pdfBlob(bytes), meta: trn(g.length, '{n} page', '{n} pages') });
      }
      return { files, note: trn(files.length, '{n} file created from {total} pages', '{n} files created from {total} pages', { total }), zipName: `${nm}_split.zip` };
    }
  },

  organize: {
    opts: () => `<div class="info">${tr('Drag pages to reorder. Use ⟳ to rotate and 🗑 to delete a page.')}</div>
      <div class="grid grid-cols-2 gap-2">
        <button data-org="left" class="btn-ghost">${icon('rotateL', 'w-4 h-4')} ${tr('Rotate all')}</button>
        <button data-org="right" class="btn-ghost">${icon('rotate', 'w-4 h-4')} ${tr('Rotate all')}</button>
        <button data-org="reverse" class="btn-ghost">${icon('swap', 'w-4 h-4')} ${tr('Reverse')}</button>
        <button data-org="reset" class="btn-ghost">${icon('refresh', 'w-4 h-4')} ${tr('Reset')}</button>
      </div>`,
    bind() {
      $('#opts').addEventListener('click', e => {
        const b = e.target.closest('[data-org]'); if (!b || !S.files.length) return;
        const k = b.dataset.org;
        if (k === 'left' || k === 'right') S.pages.forEach(p => p.rot += k === 'left' ? -90 : 90);
        if (k === 'reverse') S.pages.reverse();
        if (k === 'reset') { const th = Object.fromEntries(S.pages.map(p => [p.src, p.thumb])); preparePagesKeep(th); }
        renderWork();
      });
      function preparePagesKeep(th) {
        const f = S.files[0];
        if (S.pages.length === f.pageCount && Object.keys(th).length === f.pageCount) {
          S.pages = Array.from({ length: f.pageCount }, (_, i) => ({ id: uid(), src: i, rot: 0, thumb: th[i] }));
        } else preparePages();
      }
    },
    async run() {
      const f = S.files[0];
      const src = await loadPdfLib(f.buf), out = await PDFDocument.create();
      busy(true, tr('Rebuilding document…'), .4);
      const pages = await out.copyPages(src, S.pages.map(p => p.src));
      pages.forEach((pg, i) => { const r = norm(S.pages[i].rot); if (r) pg.setRotation(degrees(norm(pg.getRotation().angle + r))); out.addPage(pg); });
      const bytes = await out.save();
      return { files: [{ name: `${base(f.name)}_organized.pdf`, blob: pdfBlob(bytes) }], note: `${trn(S.pages.length, '{n} page', '{n} pages')} · ${fmt(bytes.length)}` };
    }
  },

  rotate: {
    opts: () => `${field('Rotation', seg('angle', [['90', '90° ↻'], ['180', '180°'], ['270', '90° ↺']], '90'))}
      ${field('Apply to', seg('which', [['all', 'All'], ['odd', 'Odd'], ['even', 'Even'], ['custom', 'Custom']], 'all'))}
      <div id="customBox" class="hidden">${field('Pages', `<input id="rotPages" class="inp" placeholder="${tr('e.g. 1, 3-5')}">`)}</div>`,
    onOpt() {
      $('#customBox').classList.toggle('hidden', getSeg('which') !== 'custom');
      const im = $('#thumbImg'); if (im) im.style.transform = `rotate(${getSeg('angle')}deg) scale(${getSeg('angle') === '180' ? 1 : .72})`;
    },
    afterRender() { this.onOpt(); },
    async run() {
      const f = S.files[0], ang = +getSeg('angle');
      const set = pageTargets(getSeg('which'), $('#rotPages').value, f.pageCount);
      const doc = await loadPdfLib(f.buf);
      doc.getPages().forEach((p, i) => { if (set.has(i)) p.setRotation(degrees(norm(p.getRotation().angle + ang))); });
      const bytes = await doc.save();
      return { files: [{ name: `${base(f.name)}_rotated.pdf`, blob: pdfBlob(bytes) }], note: trn(set.size, '{n} page rotated {a}', '{n} pages rotated {a}', { a: ang === 270 ? tr('90° counter-clockwise') : ang + '°' }) };
    }
  },

  compress: {
    LV: { low: { s: 2, q: .82 }, med: { s: 1.5, q: .68 }, high: { s: 1.15, q: .5 } },
    opts: () => `${field('Compression level', seg('level', [['low', 'Light'], ['med', 'Balanced'], ['high', 'Strong']], 'med'), 'Light keeps the best quality; Strong gives the smallest file.')}
      <label class="flex items-center gap-3 text-sm cursor-pointer"><input id="gray" type="checkbox" class="chk"> ${tr('Convert to grayscale')}</label>
      <div class="info">${tr('Pages are re-rendered as optimized images. Great for scans and image-heavy PDFs; text will no longer be selectable.')}</div>`,
    async run() {
      const f = S.files[0], lv = this.LV[getSeg('level')], gray = $('#gray').checked;
      const out = await PDFDocument.create();
      for (let i = 1; i <= f.pageCount; i++) {
        busy(true, tr('Compressing page {i} of {n}', { i, n: f.pageCount }), (i - 1) / f.pageCount);
        const c = await renderPage(f.pdf, i, { scale: lv.s });
        if (gray) { const ctx = c.getContext('2d'), d = ctx.getImageData(0, 0, c.width, c.height), a = d.data; for (let k = 0; k < a.length; k += 4) { const y = a[k] * .299 + a[k + 1] * .587 + a[k + 2] * .114; a[k] = a[k + 1] = a[k + 2] = y; } ctx.putImageData(d, 0, 0); }
        const jpg = await canvasBytes(c, 'image/jpeg', lv.q);
        const img = await out.embedJpg(jpg);
        const pg = out.addPage([c.pw, c.ph]);
        pg.drawImage(img, { x: 0, y: 0, width: c.pw, height: c.ph });
        c.width = c.height = 0;
      }
      busy(true, tr('Saving…'), .98);
      const bytes = await out.save();
      const saved = 1 - bytes.length / f.size;
      const note = saved > 0.01 ? `${fmt(f.size)} → ${fmt(bytes.length)} · <b class="text-emerald-600">${tr('{p}% smaller', { p: Math.round(saved * 100) })}</b>` : esc(tr('Result is {size} — this PDF is already well optimized. Try "Strong" or grayscale.', { size: fmt(bytes.length) }));
      return { files: [{ name: `${base(f.name)}_compressed.pdf`, blob: pdfBlob(bytes) }], note, html: true };
    }
  },

  'img-to-pdf': {
    SIZES: { a4: [595.28, 841.89], letter: [612, 792] },
    opts: () => `${field('Page size', seg('size', [['fit', 'Fit image'], ['a4', 'A4'], ['letter', 'Letter']], 'a4'))}
      ${field('Orientation', seg('orient', [['auto', 'Auto'], ['portrait', 'Portrait'], ['landscape', 'Landscape']], 'auto'))}
      ${field('Margin', seg('margin', [['0', 'None'], ['20', 'Small'], ['40', 'Large']], '20'))}
      ${field('Output file name', `<input id="outName" class="inp" value="images">`)}`,
    async run() {
      const doc = await PDFDocument.create();
      const size = getSeg('size'), orient = getSeg('orient'), m = +getSeg('margin');
      for (let i = 0; i < S.files.length; i++) {
        const f = S.files[i]; busy(true, tr('Adding {name}', { name: f.name }), i / S.files.length);
        let im;
        if (f.type === 'image/png') { try { im = await doc.embedPng(new Uint8Array(await f.file.arrayBuffer())); } catch (er) { im = await doc.embedPng(await canvasBytes(this.toCanvas(f), 'image/png')); } }
        else im = await doc.embedJpg(await canvasBytes(this.toCanvas(f, true), 'image/jpeg', .92));
        let pw, ph, w, h;
        if (size === 'fit') { w = im.width * .75; h = im.height * .75; pw = w + 2 * m; ph = h + 2 * m; }
        else {
          [pw, ph] = this.SIZES[size];
          if (orient === 'landscape' || (orient === 'auto' && im.width > im.height)) [pw, ph] = [ph, pw];
          const s = Math.min((pw - 2 * m) / im.width, (ph - 2 * m) / im.height);
          w = im.width * s; h = im.height * s;
        }
        doc.addPage([pw, ph]).drawImage(im, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      const bytes = await doc.save();
      const name = (($('#outName').value || 'images').trim().replace(/\.pdf$/i, '') || 'images') + '.pdf';
      return { files: [{ name, blob: pdfBlob(bytes) }], note: `${trn(S.files.length, '{n} image', '{n} images')} · ${fmt(bytes.length)}` };
    },
    toCanvas(f, white) {
      const c = document.createElement('canvas'); c.width = f.w; c.height = f.h;
      const ctx = c.getContext('2d'); if (white) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(f.el, 0, 0); return c;
    }
  },

  'pdf-to-img': {
    opts: () => `${field('Image format', seg('fmt', [['png', 'PNG'], ['jpg', 'JPG']], 'png'))}
      ${field('Quality', seg('scale', [['1', 'Normal'], ['2', 'High'], ['3', 'Ultra']], '2'), 'Higher quality = larger images (Normal ≈ 72 DPI, High ≈ 144, Ultra ≈ 216).')}
      ${field('Pages', `<input id="imgPages" class="inp" placeholder="${tr('All pages (or e.g. 1-3, 6)')}">`)}`,
    async run() {
      const f = S.files[0], ext = getSeg('fmt'), sc = +getSeg('scale');
      const txt = $('#imgPages').value.trim();
      const idx = txt ? [...new Set(parseRanges(txt, f.pageCount).flat())] : [...Array(f.pageCount).keys()];
      const files = [];
      for (let k = 0; k < idx.length; k++) {
        busy(true, tr('Rendering page {n}', { n: idx[k] + 1 }), k / idx.length);
        const c = await renderPage(f.pdf, idx[k] + 1, { scale: sc, white: ext === 'jpg' });
        const blob = await canvasBlob(c, ext === 'png' ? 'image/png' : 'image/jpeg', .92);
        const url = URL.createObjectURL(blob); S.urls.push(url);
        files.push({ name: `${base(f.name)}_page-${idx[k] + 1}.${ext}`, blob, preview: url, meta: `${c.width}×${c.height}` });
        c.width = c.height = 0;
      }
      return { files, note: trn(files.length, '{n} image created', '{n} images created'), zipName: `${base(f.name)}_images.zip`, gallery: true };
    }
  },

  watermark: {
    opts: () => `${field('Watermark text', `<input id="wmText" class="inp" value="CONFIDENTIAL" maxlength="80">`, 'Any language works — English, বাংলা, العربية…')}
      ${field('Layout', seg('wmLayout', [['center', 'Center'], ['tile', 'Tiled']], 'center'))}
      ${field('Font size', slider('wmSize', 12, 160, 64, 'pt'))}
      ${field('Opacity', slider('wmOp', 5, 100, 25, '%'))}
      ${field('Rotation', slider('wmRot', -90, 90, 45, '°'))}
      ${field('Color', `<div class="flex items-center gap-3"><input id="wmColor" type="color" value="#e11d48" class="swatch">
        <div class="flex gap-2">${['#e11d48', '#2563eb', '#16a34a', '#111827', '#9ca3af'].map(c => `<button data-color="${c}" class="w-7 h-7 rounded-full border-2 border-white hover:scale-110 transition" style="background:${c}"></button>`).join('')}</div></div>`)}`,
    bind() { $('#opts').addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (b) { $('#wmColor').value = b.dataset.color; this.onOpt(); } }); },
    vals: () => ({ text: $('#wmText').value, size: +$('#wmSize').value, op: +$('#wmOp').value / 100, rot: +$('#wmRot').value, color: $('#wmColor').value, layout: getSeg('wmLayout') }),
    onOpt() {
      const ov = $('#ov'), f = S.files[0]; if (!ov || !f) return;
      const v = this.vals(), s = ov.clientWidth / f.pw, H = ov.clientHeight;
      const span = (x, y) => `<span style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${-v.rot}deg);font:700 ${v.size * s}px Inter,'Hind Siliguri',sans-serif;color:${v.color};opacity:${v.op};white-space:nowrap">${esc(v.text)}</span>`;
      if (v.layout === 'center') ov.innerHTML = span(ov.clientWidth / 2, H / 2);
      else ov.innerHTML = tileCenters(f.pw, f.ph, measure(v.text, v.size), v.size * 1.45, v.size).map(([x, y]) => span(x * s, (f.ph - y) * s)).join('');
    },
    afterRender() { const im = $('#thumbImg'); if (im) { im.complete ? this.onOpt() : im.addEventListener('load', () => this.onOpt(), { once: true }); } },
    async run() {
      const f = S.files[0], v = this.vals();
      if (!v.text.trim()) throw new Error(tr('Enter some watermark text'));
      const doc = await loadPdfLib(f.buf);
      const c = await textCanvas(v.text, v.size * 4, v.color);
      const im = await doc.embedPng(await canvasBytes(c, 'image/png'));
      const w = c.width / 4, h = c.height / 4, r = v.rot * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r);
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        if (i % 20 === 0) busy(true, tr('Stamping page {n}', { n: i + 1 }), i / pages.length);
        const { width: pw, height: ph } = page.getSize();
        const pts = v.layout === 'center' ? [[pw / 2, ph / 2]] : tileCenters(pw, ph, w, h, v.size);
        for (const [cx, cy] of pts) page.drawImage(im, { x: cx - (w / 2) * cos + (h / 2) * sin, y: cy - (w / 2) * sin - (h / 2) * cos, width: w, height: h, rotate: degrees(v.rot), opacity: v.op });
      });
      const bytes = await doc.save();
      return { files: [{ name: `${base(f.name)}_watermarked.pdf`, blob: pdfBlob(bytes) }], note: trn(pages.length, 'Watermark added to {n} page', 'Watermark added to {n} pages') };
    }
  },

  'page-numbers': {
    FMT: [['{n}', '1'], ['Page {n}', 'Page 1'], ['{n} / {total}', '1 / 10'], ['Page {n} of {total}', 'Page 1 of 10'], ['- {n} -', '- 1 -']],
    opts() {
      return `${field('Position', seg('pos', [['tl', '↖'], ['tc', '↑'], ['tr', '↗'], ['bl', '↙'], ['bc', '↓'], ['br', '↘']], 'bc', 3))}
      ${field('Format', `<select id="pnFmt" class="inp">${this.FMT.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>`)}
      <div class="grid grid-cols-2 gap-3">${field('Start at', `<input id="pnStart" type="number" min="0" value="1" class="inp">`)}${field('Color', `<input id="pnColor" type="color" value="#374151" class="swatch !w-full">`)}</div>
      ${field('Font size', slider('pnSize', 7, 28, 11, 'pt'))}
      ${field('Margin', slider('pnMargin', 8, 72, 28, 'pt'))}
      <label class="flex items-center gap-3 text-sm cursor-pointer"><input id="pnSkip" type="checkbox" class="chk"> ${tr('Skip first page (cover)')}</label>`;
    },
    vals: () => ({ pos: getSeg('pos'), fmt: $('#pnFmt').value, start: parseInt($('#pnStart').value, 10) || 0, color: $('#pnColor').value, size: +$('#pnSize').value, m: +$('#pnMargin').value, skip: $('#pnSkip').checked }),
    label(v, i, total) { return v.fmt.replace('{n}', v.start + i).replace('{total}', total + v.start - 1); },
    onOpt() {
      const ov = $('#ov'), f = S.files[0]; if (!ov || !f) return;
      const v = this.vals(), s = ov.clientWidth / f.pw;
      if (v.skip) { ov.innerHTML = `<span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800/80 text-white px-2 py-0.5 rounded-full">${tr('Cover — no number')}</span>`; return; }
      const vert = v.pos[0] === 't' ? `top:${v.m * s}px` : `bottom:${v.m * s}px`;
      const hor = { l: `left:${v.m * s}px`, r: `right:${v.m * s}px`, c: 'left:50%;transform:translateX(-50%)' }[v.pos[1]];
      ov.innerHTML = `<span style="position:absolute;${vert};${hor};font:${Math.max(5, v.size * s)}px Helvetica,Arial,sans-serif;line-height:1;color:${v.color};white-space:nowrap">${esc(this.label(v, 0, f.pageCount - (v.skip ? 1 : 0)))}</span>`;
    },
    afterRender() { const im = $('#thumbImg'); if (im) { im.complete ? this.onOpt() : im.addEventListener('load', () => this.onOpt(), { once: true }); } },
    async run() {
      const f = S.files[0], v = this.vals();
      const doc = await loadPdfLib(f.buf), font = await doc.embedFont(StandardFonts.Helvetica), color = hexRgb(v.color);
      const pages = doc.getPages(), total = pages.length - (v.skip ? 1 : 0);
      pages.forEach((page, i) => {
        if (v.skip && i === 0) return;
        const n = v.skip ? i - 1 : i, txt = this.label(v, n, total);
        const { x: bx, y: by, width: w, height: h } = page.getMediaBox();
        const tw = font.widthOfTextAtSize(txt, v.size);
        const x = bx + (v.pos[1] === 'l' ? v.m : v.pos[1] === 'r' ? w - v.m - tw : (w - tw) / 2);
        const y = by + (v.pos[0] === 't' ? h - v.m - v.size : v.m);
        page.drawText(txt, { x, y, size: v.size, font, color });
      });
      const bytes = await doc.save();
      return { files: [{ name: `${base(f.name)}_numbered.pdf`, blob: pdfBlob(bytes) }], note: trn(total, 'Numbers added to {n} page', 'Numbers added to {n} pages') };
    }
  },

  'extract-text': {
    opts: () => `${field('Page separators', seg('sep', [['yes', 'Show'], ['no', 'Hide']], 'yes'))}
      <div class="info">${tr("Works with PDFs that contain real text. Scanned documents (images of text) won't produce output.")}</div>`,
    async run() {
      const f = S.files[0], sep = getSeg('sep') === 'yes', parts = [];
      for (let i = 1; i <= f.pageCount; i++) {
        busy(true, tr('Reading page {i} of {n}', { i, n: f.pageCount }), (i - 1) / f.pageCount);
        const page = await f.pdf.getPage(i), tc = await page.getTextContent();
        const t = tc.items.map(it => (it.str || '') + (it.hasEOL ? '\n' : '')).join('').replace(/[ \t]+\n/g, '\n').trim();
        parts.push(sep ? `──────── Page ${i} ────────\n\n${t}` : t);
      }
      const text = parts.join('\n\n');
      const has = parts.some(p => p.replace(/─+ Page \d+ ─+/g, '').trim());
      return { files: [{ name: `${base(f.name)}.txt`, blob: new Blob([text], { type: 'text/plain;charset=utf-8' }) }], text, note: has ? trn(f.pageCount, '{c} characters from {n} page', '{c} characters from {n} pages', { c: text.length.toLocaleString() }) : tr('No selectable text found — this PDF may be scanned images.') };
    }
  },

  metadata: {
    KEYS: [['Title', 'Title'], ['Author', 'Author'], ['Subject', 'Subject'], ['Keywords', 'Keywords'], ['Creator', 'Creator'], ['Producer', 'Producer']],
    opts() { return this.KEYS.map(([k, l]) => field(l, `<input id="md${k}" class="inp" placeholder="${k === 'Keywords' ? tr('comma, separated, words') : '—'}" disabled>`)).join(''); },
    async onLoad() {
      const doc = await PDFDocument.load(S.files[0].buf, { ignoreEncryption: true, updateMetadata: false });
      this.KEYS.forEach(([k]) => { const el = $('#md' + k); if (!el) return; el.disabled = false; el.value = doc['get' + k]() || ''; });
    },
    async run() {
      const f = S.files[0], doc = await PDFDocument.load(f.buf, { ignoreEncryption: true, updateMetadata: false });
      const g = k => $('#md' + k).value.trim();
      doc.setTitle(g('Title')); doc.setAuthor(g('Author')); doc.setSubject(g('Subject'));
      doc.setKeywords(g('Keywords').split(',').map(s => s.trim()).filter(Boolean));
      doc.setCreator(g('Creator')); doc.setProducer(g('Producer')); doc.setModificationDate(new Date());
      const bytes = await doc.save();
      return { files: [{ name: f.name.replace(/\.pdf$/i, '') + '.pdf', blob: pdfBlob(bytes) }], note: tr('Metadata updated') };
    }
  },

  /* ---------- Sign PDF ---------- */
  sign: {
    st: { strokes: [], uploadRaw: null, cx: .7, cy: .86, aspect: .36 },
    INKS: ['#111827', '#1d4ed8', '#be123c'],
    FONTS: ['Dancing Script', 'Great Vibes', 'Caveat'],
    opts() {
      const st = this.st, mode = st.mode || 'draw';
      return `${field('Signature', seg('sigMode', [['draw', 'Draw'], ['type', 'Type'], ['upload', 'Upload']], mode))}
      <div data-panel="draw" class="${mode === 'draw' ? '' : 'hidden'}">
        <canvas id="sigPad" class="sig-pad block w-full h-36 sm:h-40 rounded-2xl touch-none"></canvas>
        <div class="flex justify-between items-center gap-2 mt-2"><span class="text-xs text-slate-400">${tr('Sign with your mouse, finger or stylus')}</span>
          <button type="button" data-sig="clear" class="btn-ghost !py-1.5 !px-3 !text-xs shrink-0">${icon('refresh', 'w-3.5 h-3.5')} ${tr('Clear')}</button></div>
      </div>
      <div data-panel="type" class="space-y-3 ${mode === 'type' ? '' : 'hidden'}">
        <input id="sigText" class="inp" maxlength="40" autocomplete="name" placeholder="${tr('Type your name')}" value="${esc(st.text || '')}">
        <div class="seg" style="display:grid;grid-template-columns:repeat(3,1fr)">${this.FONTS.map(fn => `<label><input type="radio" name="sigFont" value="${fn}" ${(st.font || this.FONTS[0]) === fn ? 'checked' : ''}><span style="font-family:'${fn}',cursive;font-size:1.25rem;font-weight:600;line-height:1.2">Sign</span></label>`).join('')}</div>
      </div>
      <div data-panel="upload" class="space-y-3 ${mode === 'upload' ? '' : 'hidden'}">
        <button type="button" data-sig="upload" class="btn-ghost w-full !py-3">${icon('upload', 'w-4 h-4')} ${tr('Choose signature image')}</button>
        <div id="sigUpPrev" class="sig-pad !cursor-default h-24 rounded-2xl grid place-items-center overflow-hidden p-2"><span class="text-xs text-slate-400 text-center px-3">${tr('PNG or JPG — a photo of your signature works too')}</span></div>
        <label class="flex items-center gap-3 text-sm cursor-pointer"><input id="sigClean" type="checkbox" class="chk" ${st.clean !== false ? 'checked' : ''}> ${tr('Remove white background')}</label>
        <input id="sigFile" type="file" accept="image/*" class="hidden">
      </div>
      <div id="inkBox" class="${mode === 'upload' ? 'hidden' : ''}">${field('Ink color', `<div class="flex gap-3 pl-1">${this.INKS.map(c => `<label class="cursor-pointer"><input type="radio" name="sigInk" value="${c}" class="sr-only" ${(st.ink || this.INKS[0]) === c ? 'checked' : ''}><span class="ink-dot" style="background:${c}"></span></label>`).join('')}</div>`)}</div>
      ${field('Signature size', slider('sigSize', 8, 60, st.size || 28, '%'))}
      ${field('Place on', seg('sigWhere', [['this', 'This page'], ['all', 'All pages'], ['custom', 'Custom']], 'this'))}
      <div id="customBox" class="hidden">${field('Pages', `<input id="sigPages" class="inp" placeholder="${tr('e.g. 1, 3-5')}">`)}</div>`;
    },
    ink() { return getSeg('sigInk') || this.st.ink || this.INKS[0]; },
    bind() {
      const st = this.st, pad = $('#sigPad');
      this.fitPad = () => {
        const r = pad.getBoundingClientRect(); if (!r.width) return;
        pad.width = Math.round(r.width * 2); pad.height = Math.round(r.height * 2); st.aspect = r.height / r.width;
        this.paint(pad, this.ink());
      };
      requestAnimationFrame(this.fitPad);
      if (this._onResize) window.removeEventListener('resize', this._onResize);
      this._onResize = () => { if (document.body.contains(pad)) this.fitPad(); };
      window.addEventListener('resize', this._onResize);
      let cur = null;
      const pt = e => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
      pad.addEventListener('pointerdown', e => { e.preventDefault(); pad.setPointerCapture(e.pointerId); cur = [pt(e)]; st.strokes.push(cur); this.paint(pad, this.ink()); });
      pad.addEventListener('pointermove', e => { if (!cur) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (evs.length ? evs : [e]).forEach(ev => cur.push(pt(ev))); this.paint(pad, this.ink()); });
      const end = () => { if (cur) { cur = null; this.refresh(); } };
      pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
      $('#opts').addEventListener('click', e => {
        const b = e.target.closest('[data-sig]'); if (!b) return;
        if (b.dataset.sig === 'clear') { st.strokes = []; this.paint(pad, this.ink()); this.refresh(); }
        if (b.dataset.sig === 'upload') $('#sigFile').click();
      });
      $('#sigFile').addEventListener('change', e => {
        const file = e.target.files[0]; e.target.value = ''; if (!file) return;
        const url = URL.createObjectURL(file), im = new Image();
        im.onload = () => {
          const s = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
          st.uploadRaw = c; this.refresh();
        };
        im.onerror = () => { URL.revokeObjectURL(url); toast(tr('Please choose image files (JPG, PNG, WEBP…)'), 'error'); };
        im.src = url;
      });
    },
    paint(c, ink) {
      const ctx = c.getContext('2d'), W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2, H * .024); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const s of this.st.strokes) {
        ctx.beginPath(); ctx.moveTo(s[0][0] * W, s[0][1] * H);
        if (s.length === 1) ctx.lineTo(s[0][0] * W + .5, s[0][1] * H);
        for (let i = 1; i < s.length - 1; i++) ctx.quadraticCurveTo(s[i][0] * W, s[i][1] * H, (s[i][0] + s[i + 1][0]) / 2 * W, (s[i][1] + s[i + 1][1]) / 2 * H);
        if (s.length > 1) ctx.lineTo(s[s.length - 1][0] * W, s[s.length - 1][1] * H);
        ctx.stroke();
      }
    },
    async build() {
      const mode = getSeg('sigMode') || 'draw', st = this.st;
      if (mode === 'draw') {
        if (!st.strokes.length) return null;
        const c = document.createElement('canvas'); c.width = 1400; c.height = Math.round(1400 * (st.aspect || .36));
        this.paint(c, this.ink()); return trimCanvas(c);
      }
      if (mode === 'type') {
        const txt = ($('#sigText')?.value || '').trim(); if (!txt) return null;
        const fn = getSeg('sigFont') || this.FONTS[0], px = 170, fam = `"${fn}", "Hind Siliguri", cursive`;
        try { await document.fonts.load(`600 ${px}px "${fn}"`, txt); } catch (e) {}
        const c = document.createElement('canvas'), ctx = c.getContext('2d');
        ctx.font = `600 ${px}px ${fam}`;
        c.width = Math.ceil(ctx.measureText(txt).width + px); c.height = Math.ceil(px * 1.9);
        ctx.font = `600 ${px}px ${fam}`; ctx.fillStyle = this.ink(); ctx.textBaseline = 'middle'; ctx.fillText(txt, px / 2, c.height / 2);
        return trimCanvas(c);
      }
      const raw = st.uploadRaw; if (!raw) return null;
      const c = document.createElement('canvas'); c.width = raw.width; c.height = raw.height;
      const ctx = c.getContext('2d'); ctx.drawImage(raw, 0, 0);
      if ($('#sigClean') ? $('#sigClean').checked : st.clean !== false) {
        const d = ctx.getImageData(0, 0, c.width, c.height), a = d.data;
        for (let k = 0; k < a.length; k += 4) { const m = Math.min(a[k], a[k + 1], a[k + 2]); if (m > 222) a[k + 3] = 0; else if (m > 160) a[k + 3] = Math.round(a[k + 3] * (222 - m) / 62); }
        ctx.putImageData(d, 0, 0);
      }
      return trimCanvas(c, 2) || c;
    },
    async refresh() {
      const tok = (this._tok = (this._tok || 0) + 1);
      const c = await this.build(); if (tok !== this._tok) return;
      this.st.sig = c ? { url: c.toDataURL('image/png'), w: c.width, h: c.height, canvas: c } : null;
      this.place();
    },
    place() {
      const st = this.st, up = $('#sigUpPrev');
      if (up && st.uploadRaw && getSeg('sigMode') === 'upload' && st.sig) up.innerHTML = `<img src="${st.sig.url}" class="max-h-full max-w-full object-contain">`;
      const ov = $('#ov'); if (!ov) return;
      if (!st.sig) { ov.innerHTML = `<div class="absolute inset-x-0 bottom-3 text-center pointer-events-none"><span class="text-[11px] bg-slate-800/80 text-white px-2.5 py-1 rounded-full">${tr('Create your signature in the options panel')}</span></div>`; return; }
      ov.innerHTML = `<img src="${st.sig.url}" draggable="false" style="position:absolute;left:${st.cx * 100}%;top:${st.cy * 100}%;width:${+$('#sigSize').value}%;transform:translate(-50%,-50%);outline:1.5px dashed rgba(139,92,246,.95);outline-offset:4px;border-radius:2px;pointer-events:none">`;
    },
    onOpt(e) {
      const st = this.st, mode = getSeg('sigMode') || 'draw', id = e && e.target && (e.target.name || e.target.id);
      st.mode = mode;
      $$('[data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== mode));
      $('#inkBox').classList.toggle('hidden', mode === 'upload');
      $('#customBox').classList.toggle('hidden', getSeg('sigWhere') !== 'custom');
      if (id === 'sigMode' && mode === 'draw') requestAnimationFrame(() => this.fitPad && this.fitPad());
      if (id === 'sigSize' || id === 'sigWhere' || id === 'sigPages') { st.size = +$('#sigSize').value; return this.place(); }
      if (id === 'sigText') st.text = e.target.value;
      if (id === 'sigFont') st.font = getSeg('sigFont');
      if (id === 'sigClean') st.clean = e.target.checked;
      if (id === 'sigInk') { st.ink = getSeg('sigInk'); const pad = $('#sigPad'); if (pad && pad.width) this.paint(pad, this.ink()); }
      if (id === 'sigFile') return;
      this.refresh();
    },
    afterRender() {
      const ov = $('#ov'); if (!ov) return;
      let down = false;
      const setPos = ev => {
        const r = ov.getBoundingClientRect();
        this.st.cx = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
        this.st.cy = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
        this.place();
      };
      ov.addEventListener('pointerdown', ev => { down = true; try { ov.setPointerCapture(ev.pointerId); } catch (er) {} setPos(ev); });
      ov.addEventListener('pointermove', ev => { if (down) setPos(ev); });
      ov.addEventListener('pointerup', () => { down = false; });
      ov.addEventListener('pointercancel', () => { down = false; });
      this.refresh();
    },
    async run() {
      const f = S.files[0], st = this.st;
      await this.refresh();
      if (!st.sig) throw new Error(tr('Create your signature first'));
      const where = getSeg('sigWhere');
      const set = where === 'all' ? new Set([...Array(f.pageCount).keys()]) : where === 'custom' ? pageTargets('custom', $('#sigPages').value, f.pageCount) : new Set([(S.view || 1) - 1]);
      const doc = await loadPdfLib(f.buf), img = await doc.embedPng(await canvasBytes(st.sig.canvas, 'image/png')), frac = +$('#sigSize').value / 100;
      doc.getPages().forEach((p, i) => {
        if (!set.has(i)) return;
        const fr = visualFrame(p), w = frac * fr.VW, h = w * st.sig.h / st.sig.w;
        drawUpright(p, fr, img, st.cx * fr.VW, (1 - st.cy) * fr.VH, w, h);
      });
      const bytes = await doc.save();
      return { files: [{ name: `${base(f.name)}_signed.pdf`, blob: pdfBlob(bytes) }], note: trn(set.size, 'Signature added to {n} page', 'Signature added to {n} pages') };
    }
  },

  /* ---------- Crop PDF ---------- */
  crop: {
    IDS: ['cropT', 'cropR', 'cropB', 'cropL'],
    opts() {
      return `<label class="flex items-center gap-3 text-sm cursor-pointer"><input id="cropLink" type="checkbox" class="chk" checked> ${tr('Same margin on all sides')}</label>
      ${[['cropT', 'Top'], ['cropR', 'Right'], ['cropB', 'Bottom'], ['cropL', 'Left']].map(([id, l]) => field(l, slider(id, 0, 45, 5, '%', .5))).join('')}
      ${field('Apply to', seg('which', [['all', 'All'], ['odd', 'Odd'], ['even', 'Even'], ['custom', 'Custom']], 'all'))}
      <div id="customBox" class="hidden">${field('Pages', `<input id="cropPages" class="inp" placeholder="${tr('e.g. 1, 3-5')}">`)}</div>
      <div class="info">${tr('Cropping hides the outer area of each page. Use the arrows under the preview to check other pages.')}</div>`;
    },
    vals() { return this.IDS.map(id => +$('#' + id).value / 100); },
    onOpt(e) {
      $('#customBox').classList.toggle('hidden', getSeg('which') !== 'custom');
      const id = e && e.target && e.target.id;
      if (this.IDS.includes(id) && $('#cropLink').checked) this.IDS.forEach(k => { if (k !== id) { $('#' + k).value = e.target.value; $('#' + k + 'V').textContent = e.target.value + '%'; } });
      const ov = $('#ov'); if (!ov) return;
      const [t, r, b, l] = this.vals();
      ov.innerHTML = `<div style="position:absolute;left:${l * 100}%;top:${t * 100}%;right:${r * 100}%;bottom:${b * 100}%;box-shadow:0 0 0 9999px rgba(15,13,26,.55);outline:2px dashed #fff;outline-offset:-1px"></div>`;
    },
    afterRender() { this.onOpt(); },
    async run() {
      const f = S.files[0], v = this.vals();
      const set = pageTargets(getSeg('which'), $('#cropPages').value, f.pageCount);
      const doc = await loadPdfLib(f.buf);
      doc.getPages().forEach((p, i) => {
        if (!set.has(i)) return;
        // Sliders are in visual space; map them onto the unrotated page sides.
        const k = (norm(p.getRotation().angle) / 90) | 0, u = [];
        v.forEach((val, j) => { u[(j - k + 4) % 4] = val; });
        const [t, r, b, l] = u, bx = p.getCropBox();
        const box = [bx.x + l * bx.width, bx.y + b * bx.height, bx.width * (1 - l - r), bx.height * (1 - t - b)];
        p.setMediaBox(...box); p.setCropBox(...box);
      });
      const bytes = await doc.save();
      return { files: [{ name: `${base(f.name)}_cropped.pdf`, blob: pdfBlob(bytes) }], note: `${trn(set.size, '{n} page cropped', '{n} pages cropped')} · ${fmt(bytes.length)}` };
    }
  },

  /* ---------- Resize pages ---------- */
  resize: {
    opts: () => `${field('Page size', seg('sheet', [['a4', 'A4'], ['letter', 'Letter'], ['legal', 'Legal'], ['a3', 'A3'], ['a5', 'A5']], 'a4'))}
      ${field('Orientation', seg('orient', [['auto', 'Auto'], ['portrait', 'Portrait'], ['landscape', 'Landscape']], 'auto'))}
      ${field('Margin', slider('rsMargin', 0, 72, 0, 'pt'))}
      <div class="info">${tr('Every page is scaled to fit the new size without distortion and centred. Links and form fields are flattened.')}</div>`,
    async run() {
      const f = S.files[0], key = getSeg('sheet'), [sw, sh] = SHEETS[key], orient = getSeg('orient'), m = +$('#rsMargin').value;
      const { out, items } = await embedAll(f);
      items.forEach(({ emb, r, vw, vh }, i) => {
        if (i % 10 === 0) busy(true, tr('Resizing page {i} of {n}', { i: i + 1, n: items.length }), .5 + i / items.length * .45);
        const land = orient === 'landscape' || (orient === 'auto' && vw > vh);
        const [pw, ph] = land ? [sh, sw] : [sw, sh];
        const s = Math.min((pw - 2 * m) / vw, (ph - 2 * m) / vh);
        drawEmbedded(out.addPage([pw, ph]), emb, (pw - vw * s) / 2, (ph - vh * s) / 2, s, r);
      });
      busy(true, tr('Saving…'), .97);
      const bytes = await out.save();
      return { files: [{ name: `${base(f.name)}_${key}.pdf`, blob: pdfBlob(bytes) }], note: `${trn(items.length, '{n} page', '{n} pages')} · ${key.toUpperCase()} · ${fmt(bytes.length)}` };
    }
  },

  /* ---------- Pages per sheet (N-up) ---------- */
  'n-up': {
    GRID: { 2: [2, 1], 4: [2, 2], 6: [3, 2], 9: [3, 3] },
    opts: () => `${field('Pages per sheet', seg('per', [['2', '2'], ['4', '4'], ['6', '6'], ['9', '9']], '2'))}
      ${field('Sheet size', seg('sheet', [['a4', 'A4'], ['letter', 'Letter'], ['a3', 'A3']], 'a4'))}
      ${field('Orientation', seg('orient', [['auto', 'Auto'], ['portrait', 'Portrait'], ['landscape', 'Landscape']], 'auto'))}
      ${field('Spacing', slider('nuGap', 0, 36, 12, 'pt'))}
      <label class="flex items-center gap-3 text-sm cursor-pointer"><input id="nuBorder" type="checkbox" class="chk" checked> ${tr('Draw a border around each page')}</label>`,
    // Pick the orientation + grid that shows the first page biggest.
    layout(n, sw, sh, orient, vw, vh, g) {
      const [a, b] = this.GRID[n], cand = [];
      for (const land of orient === 'auto' ? [false, true] : [orient === 'landscape'])
        for (const [cols, rows] of [[a, b], [b, a]]) {
          const [pw, ph] = land ? [sh, sw] : [sw, sh], cw = (pw - g * (cols + 1)) / cols, ch = (ph - g * (rows + 1)) / rows;
          cand.push({ pw, ph, cols, rows, cw, ch, s: Math.min(cw / vw, ch / vh) });
        }
      return cand.sort((x, y) => y.s - x.s)[0];
    },
    async run() {
      const f = S.files[0], n = +getSeg('per'), [sw, sh] = SHEETS[getSeg('sheet')], g = +$('#nuGap').value, border = $('#nuBorder').checked;
      const { out, items } = await embedAll(f);
      const L = this.layout(n, sw, sh, getSeg('orient'), items[0].vw, items[0].vh, g), sheets = Math.ceil(items.length / n);
      let sheet = null;
      items.forEach((it, i) => {
        const k = i % n;
        if (k === 0) { sheet = out.addPage([L.pw, L.ph]); busy(true, tr('Arranging sheet {i} of {n}', { i: i / n + 1, n: sheets }), .5 + i / items.length * .45); }
        const col = k % L.cols, row = Math.floor(k / L.cols);
        const s = Math.min(L.cw / it.vw, L.ch / it.vh), w = it.vw * s, h = it.vh * s;
        const ox = g + col * (L.cw + g) + (L.cw - w) / 2, oy = L.ph - g - (row + 1) * L.ch - row * g + (L.ch - h) / 2;
        drawEmbedded(sheet, it.emb, ox, oy, s, it.r);
        if (border) sheet.drawRectangle({ x: ox, y: oy, width: w, height: h, borderColor: rgb(.72, .72, .78), borderWidth: .75 });
      });
      busy(true, tr('Saving…'), .97);
      const bytes = await out.save();
      return { files: [{ name: `${base(f.name)}_${n}-up.pdf`, blob: pdfBlob(bytes) }], note: `${trn(items.length, '{n} page', '{n} pages')} → ${trn(sheets, '{n} sheet', '{n} sheets')} · ${fmt(bytes.length)}` };
    }
  },

  /* ---------- Header & footer ---------- */
  'header-footer': {
    opts: () => `${field('Header text', `<input id="hfHead" class="inp" maxlength="120" placeholder="${tr('Leave empty for none')}">`)}
      ${field('Footer text', `<input id="hfFoot" class="inp" maxlength="120" value="${esc(tr('Page {n} of {total}'))}">`, 'Tokens: {n} page · {total} total pages · {date} today · {file} file name')}
      ${field('Alignment', seg('hfAlign', [['left', 'Left'], ['center', 'Center'], ['right', 'Right']], 'center'))}
      <div class="grid grid-cols-2 gap-3">${field('Font size', `<input id="hfSize" type="number" min="6" max="36" value="10" class="inp">`)}${field('Color', `<input id="hfColor" type="color" value="#475569" class="swatch !w-full">`)}</div>
      ${field('Margin', slider('hfMargin', 10, 72, 24, 'pt'))}
      <label class="flex items-center gap-3 text-sm cursor-pointer"><input id="hfSkip" type="checkbox" class="chk"> ${tr('Skip first page (cover)')}</label>`,
    vals: () => ({ head: $('#hfHead').value, foot: $('#hfFoot').value, align: getSeg('hfAlign'), size: Math.min(36, Math.max(6, +$('#hfSize').value || 10)), color: $('#hfColor').value, m: +$('#hfMargin').value, skip: $('#hfSkip').checked }),
    fill(tpl, n, total, f) {
      const date = new Date().toLocaleDateString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return tpl.replace(/\{n\}/g, n).replace(/\{total\}/g, total).replace(/\{date\}/g, date).replace(/\{file\}/g, base(f.name));
    },
    onOpt() {
      const ov = $('#ov'), f = S.files[0]; if (!ov || !f) return;
      const v = this.vals(), s = ov.clientWidth / f.pw;
      if (v.skip) { ov.innerHTML = `<span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800/80 text-white px-2 py-0.5 rounded-full whitespace-nowrap">${tr('Cover — no number')}</span>`; return; }
      const hor = { left: `left:${v.m * s}px`, right: `right:${v.m * s}px`, center: 'left:50%;transform:translateX(-50%)' }[v.align];
      const span = (tpl, vert) => tpl.trim() ? `<span style="position:absolute;${vert};${hor};font:500 ${Math.max(4, v.size * s)}px Inter,'Hind Siliguri',sans-serif;line-height:1;color:${v.color};white-space:nowrap">${esc(this.fill(tpl, 1, f.pageCount, f))}</span>` : '';
      ov.innerHTML = span(v.head, `top:${v.m * s}px`) + span(v.foot, `bottom:${v.m * s}px`);
    },
    afterRender() { const im = $('#thumbImg'); if (im) { im.complete ? this.onOpt() : im.addEventListener('load', () => this.onOpt(), { once: true }); } },
    async run() {
      const f = S.files[0], v = this.vals();
      if (!v.head.trim() && !v.foot.trim()) throw new Error(tr('Enter a header or footer text'));
      const doc = await loadPdfLib(f.buf), pages = doc.getPages(), total = pages.length - (v.skip ? 1 : 0), cache = new Map();
      // Text is rendered to an image so any language (incl. Bangla) works.
      const stamp = async txt => {
        if (!cache.has(txt)) { const c = await textCanvas(txt, v.size * 4, v.color, 500); cache.set(txt, { img: await doc.embedPng(await canvasBytes(c, 'image/png')), w: c.width / 4, h: c.height / 4 }); }
        return cache.get(txt);
      };
      let done = 0;
      for (let i = 0; i < pages.length; i++) {
        if (v.skip && i === 0) continue;
        if (i % 10 === 0) busy(true, tr('Stamping page {n}', { n: i + 1 }), i / pages.length);
        const p = pages[i], fr = visualFrame(p), n = v.skip ? i : i + 1, pad = v.size * .2;
        for (const [tpl, top] of [[v.head, true], [v.foot, false]]) {
          const txt = this.fill(tpl, n, total, f).trim(); if (!txt) continue;
          const st = await stamp(txt);
          const cx = v.align === 'left' ? v.m - pad + st.w / 2 : v.align === 'right' ? fr.VW - v.m + pad - st.w / 2 : fr.VW / 2;
          const cy = top ? fr.VH - v.m - v.size / 2 : v.m + v.size / 2;
          drawUpright(p, fr, st.img, cx, cy, st.w, st.h);
        }
        done++;
      }
      busy(true, tr('Saving…'), .97);
      const bytes = await doc.save();
      return { files: [{ name: `${base(f.name)}_header-footer.pdf`, blob: pdfBlob(bytes) }], note: trn(done, 'Header & footer added to {n} page', 'Header & footer added to {n} pages') };
    }
  },
};

/* ================= Run & results ================= */
async function run() {
  const impl = IMPL[T.id];
  const btn = $('#runBtn'); btn.disabled = true;
  try {
    busy(true, tr('Processing…'), 0);
    await sleep(30);
    const out = await impl.run();
    busy(false);
    if (out) showResults(out);
  } catch (e) { busy(false); console.error(e); toast(e.message || tr('Something went wrong'), 'error'); }
  finally { updateRun(); }
}

function showResults(out, quiet) {
  S.results = out;
  const n = out.files.length;
  const r = $('#results');
  const note = out.html ? out.note : esc(out.note || '');
  r.innerHTML = `
  <div class="glass rounded-3xl p-5 sm:p-7 fade-in" style="box-shadow:0 20px 60px -20px rgba(16,185,129,.25)">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <div class="icon-bubble w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center text-white" style="--glow:rgba(16,185,129,.6)">${icon('check', 'w-6 h-6')}</div>
        <div class="min-w-0"><h3 class="font-display font-semibold text-lg">${n > 1 ? tr('Done! {n} files are ready', { n }) : tr('Done! Your file is ready')}</h3><p class="text-sm text-slate-500">${note}</p></div>
      </div>
      <div class="res-actions flex flex-wrap gap-2 w-full sm:w-auto">
        ${n > 1 ? `<button data-zip class="btn-primary">${icon('download', 'w-4 h-4')} ${tr('Download all (.zip)')}</button>` : `<button data-dl="0" class="btn-primary">${icon('download', 'w-4 h-4')} ${tr('Download {ext}', { ext: esc(out.files[0].name.split('.').pop().toUpperCase()) })}</button>`}
        <button data-wa class="btn-wa">${WA_SVG('w-5 h-5')} ${tr('Send on WhatsApp')}</button>
        ${out.text != null ? `<button data-copy class="btn-ghost !py-3">${icon('copy', 'w-4 h-4')} ${tr('Copy text')}</button>` : ''}
      </div>
    </div>
    ${out.text != null ? `<textarea readonly class="inp mt-5 h-80 font-mono text-xs leading-relaxed resize-y">${esc(out.text)}</textarea>` : ''}
    ${n > 1 ? `<div class="mt-6 grid ${out.gallery ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-3 max-h-[560px] overflow-y-auto pr-1">
      ${out.files.map((f, i) => out.gallery ? `
        <div class="glass-soft rounded-2xl p-2 group">
          <div class="aspect-[3/4] rounded-xl bg-slate-100/80 grid place-items-center overflow-hidden"><img src="${f.preview}" loading="lazy" class="max-w-[90%] max-h-[90%] object-contain rounded-sm shadow-lg"></div>
          <div class="flex items-center justify-between gap-2 mt-2 px-1"><div class="min-w-0"><p class="text-xs font-medium truncate">${esc(f.name)}</p><p class="text-[11px] text-slate-400">${f.meta} · ${fmt(f.blob.size)}</p></div>
          <button data-dl="${i}" class="mini-btn shrink-0" title="${tr('Download')}">${icon('download', 'w-3.5 h-3.5')}</button></div>
        </div>` : `
        <div class="glass-soft rounded-2xl p-3 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 grid place-items-center text-white shrink-0">${icon('file', 'w-5 h-5')}</div>
          <div class="min-w-0 flex-1"><p class="text-sm font-medium truncate">${esc(f.name)}</p><p class="text-[11px] text-slate-400">${f.meta ? f.meta + ' · ' : ''}${fmt(f.blob.size)}</p></div>
          <button data-dl="${i}" class="mini-btn !w-9 !h-9 shrink-0" title="${tr('Download')}">${icon('download', 'w-4 h-4')}</button>
        </div>`).join('')}
    </div>` : ''}
  </div>`;
  if (!quiet) setTimeout(() => r.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

async function onResultsClick(e) {
  const out = S.results; if (!out) return;
  const dl = e.target.closest('[data-dl]');
  if (dl) { const f = out.files[+dl.dataset.dl]; return saveFile(f.name, f.blob); }
  if (e.target.closest('[data-zip]')) {
    try { const z = await outputFile(out); await saveFile(z.name, z.blob); } catch (er) { toast(tr('Could not create ZIP'), 'error'); }
    return;
  }
  if (e.target.closest('[data-wa]')) return shareWhatsApp(out);
  if (e.target.closest('[data-copy]')) {
    try { await navigator.clipboard.writeText(out.text); toast(tr('Text copied to clipboard'), 'success'); }
    catch (er) { const ta = $('#results textarea'); ta.focus(); ta.select(); toast(tr('Press Ctrl+C to copy the selected text')); }
  }
}

/* ================= WhatsApp send ================= */
// One deliverable file: the single result, or all results packed into a ZIP (cached).
async function outputFile(out) {
  if (out.files.length === 1) return out.files[0];
  if (out._zip) return out._zip;
  busy(true, tr('Packing ZIP…'), 0);
  try {
    const zip = new JSZip(); out.files.forEach(f => zip.file(f.name, f.blob));
    const blob = await zip.generateAsync({ type: 'blob' }, m => busy(true, tr('Packing ZIP…'), m.percent / 100));
    return (out._zip = { name: out.zipName || 'files.zip', blob });
  } finally { busy(false); }
}
const MIME = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', zip: 'application/zip', txt: 'text/plain' };

async function shareWhatsApp(out) {
  let f;
  try { f = await outputFile(out); } catch (e) { return toast(tr('Could not prepare the file'), 'error'); }
  // 1) Phones & supported browsers: share the actual file straight into WhatsApp.
  try {
    const file = new File([f.blob], f.name, { type: MIME[f.name.split('.').pop()] || f.blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: f.name, text: `📄 ${f.name}` });
      return toast(tr('Shared! Pick WhatsApp from the share menu'), 'success');
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  // 2) Desktop / fallback: download the file, then open WhatsApp to attach it.
  openWaModal(f);
}

function openWaModal(f) {
  $('#waModal')?.remove();
  const m = document.createElement('div');
  m.id = 'waModal';
  m.className = 'fixed inset-0 z-[70] grid place-items-center p-4 bg-slate-900/30 backdrop-blur-sm fade-in';
  m.innerHTML = `
  <div class="glass rounded-3xl p-5 sm:p-7 w-full max-w-md relative max-h-[92vh] overflow-y-auto">
    <button data-close class="mini-btn absolute top-4 right-4" title="${tr('Close')}">${icon('x', 'w-4 h-4')}</button>
    <div class="flex items-center gap-3">
      <div class="icon-bubble w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] grid place-items-center text-white" style="--glow:rgba(37,211,102,.55)">${WA_SVG('w-6 h-6')}</div>
      <div><h3 class="font-display font-semibold text-lg text-slate-900">${tr('Send on WhatsApp')}</h3><p class="text-xs text-slate-500 truncate max-w-[16rem]">${esc(f.name)} · ${fmt(f.blob.size)}</p></div>
    </div>
    <div class="mt-6 space-y-4">
      <div class="flex gap-3">
        <span class="step">1</span>
        <div class="flex-1"><p class="text-sm font-medium text-slate-800">${tr('Save the file to your device')}</p>
          <button data-wadl class="btn-ghost mt-2">${icon('download', 'w-4 h-4')} ${tr('Download file')}</button></div>
      </div>
      <div class="flex gap-3">
        <span class="step">2</span>
        <div class="flex-1"><p class="text-sm font-medium text-slate-800">${tr('Open WhatsApp and attach it')}</p>
          <input id="waPhone" class="inp mt-2" inputmode="tel" placeholder="${tr('Phone with country code (optional) e.g. 8801XXXXXXXXX')}">
          <textarea id="waMsg" class="inp mt-2 h-20 resize-none">${esc(tr('📄 Sending you "{name}"', { name: f.name }))}</textarea>
          <a id="waLink" href="#" target="_blank" rel="noopener" class="btn-wa w-full mt-3">${WA_SVG('w-5 h-5')} ${tr('Open WhatsApp')} ${icon('external', 'w-4 h-4')}</a>
        </div>
      </div>
    </div>
    <p class="text-[11px] text-slate-400 mt-5 leading-relaxed">${tr("WhatsApp links can't carry files, so attach the downloaded file (📎) in the chat. On phones, the button shares the file directly.")}</p>
  </div>`;
  document.body.appendChild(m);
  const upd = () => {
    const ph = $('#waPhone').value.replace(/\D/g, '');
    $('#waLink').href = `https://wa.me/${ph}?text=${encodeURIComponent($('#waMsg').value)}`;
  };
  upd();
  m.addEventListener('input', upd);
  m.addEventListener('click', e => {
    if (e.target === m || e.target.closest('[data-close]')) return m.remove();
    if (e.target.closest('[data-wadl]')) return saveFile(f.name, f.blob);
    if (e.target.closest('#waLink')) setTimeout(() => m.remove(), 400);
  });
  document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { m.remove(); document.removeEventListener('keydown', k); } });
}

applyChrome();
route();
})();