export const intentMap = [
    // PRODUCTS & BROWSING
    { name: 'list_new_arrivals', examples: ['new arrivals', 'baru datang apa'], examples_id: ['barang baru apa?'], response: 'Here are the latest AC Milan drops. Type: latest', response_id: 'Ini rilisan terbaru AC Milan. Ketik: latest' },
    { name: 'list_player_issue', examples: ['player issue jerseys', 'player version'], examples_id: ['ada player issue?'], response: 'Player Issue items in stock. Type: filter pi', response_id: 'Ini stok Player Issue. Ketik: filter pi' },
    { name: 'list_match_worn', examples: ['match worn', 'worn by player'], examples_id: ['match worn ada?'], response: 'Match-worn shirts available. Type: filter mw', response_id: 'Berikut match-worn yang tersedia. Ketik: filter mw' },
    { name: 'list_long_sleeve', examples: ['long sleeve', 'manga panjang'], examples_id: ['lengan panjang'], response: 'Long sleeve Milan shirts. Type: filter ls', response_id: 'Jersey lengan panjang. Ketik: filter ls' },
    { name: 'list_goalkeeper', examples: ['goalkeeper kit', 'kiper'], examples_id: ['jersey kiper'], response: 'Goalkeeper shirts in stock. Type: filter gk', response_id: 'Stok jersey kiper. Ketik: filter gk' },
    { name: 'list_vintage_90s', examples: ['90s Milan shirt', 'vintage 90s'], examples_id: ['vintage 90an'], response: '90s Milan classics. Type: filter 90s', response_id: 'Koleksi Milan 90-an. Ketik: filter 90s' },
    { name: 'list_ucl_winner', examples: ['UCL champion shirt', 'champions league 2003'], examples_id: ['juara UCL 2003'], response: 'UCL-related Milan shirts. Type: filter ucl', response_id: 'Jersey terkait UCL Milan. Ketik: filter ucl' },
    { name: 'list_scudetto', examples: ['scudetto patch', '2010 11 scudetto'], examples_id: ['scudetto 2010/11'], response: 'Scudetto season items. Type: filter scud', response_id: 'Barang musim Scudetto. Ketik: filter scud' },
    { name: 'list_collab_offwhite', examples: ['Off-White Milan', 'off white jersey'], examples_id: ['kolaborasi Off-White'], response: 'Off-White x AC Milan items. Type: filter off', response_id: 'Koleksi Off-White x AC Milan. Ketik: filter off' },
    { name: 'list_collab_pleasures', examples: ['Pleasures Milan'], examples_id: ['Pleasures Milan'], response: 'PLEASURES x AC Milan collab. Type: filter ple', response_id: 'Kolaborasi PLEASURES x AC Milan. Ketik: filter ple' },
    { name: 'list_brand_new', examples: ['brand new only'], examples_id: ['hanya baru'], response: 'Brand new items only. Type: filter bn', response_id: 'Barang kondisi baru saja. Ketik: filter bn' },
    { name: 'list_used_excellent', examples: ['used excellent'], examples_id: ['bekas sangat baik'], response: 'Used – Excellent picks. Type: filter ue', response_id: 'Bekas – Kondisi Sangat Baik. Ketik: filter ue' },
    { name: 'list_under_1m', examples: ['under 1 million', 'cheap'], examples_id: ['di bawah 1 juta'], response: 'Under Rp 1,000,000. Type: filter <1m', response_id: 'Harga di bawah Rp1.000.000. Ketik: filter <1m' },
    { name: 'list_1m_to_2m', examples: ['1m to 2m'], examples_id: ['1 juta sampai 2 juta'], response: 'Rp1,0–2,0M range. Type: filter 1-2m', response_id: 'Rentang Rp1,0–2,0M. Ketik: filter 1-2m' },
    { name: 'list_premium', examples: ['premium jerseys', 'expensive items'], examples_id: ['barang premium'], response: 'Premium picks. Type: filter premium', response_id: 'Pilihan premium. Ketik: filter premium' },
    { name: 'list_home', examples: ['home shirt'], examples_id: ['jersey kandang'], response: 'Home shirts. Type: filter home', response_id: 'Jersey kandang. Ketik: filter home' },
    { name: 'list_away', examples: ['away shirt'], examples_id: ['jersey tandang'], response: 'Away shirts. Type: filter away', response_id: 'Jersey tandang. Ketik: filter away' },
    { name: 'list_third', examples: ['third shirt'], examples_id: ['jersey third'], response: 'Third shirts. Type: filter third', response_id: 'Jersey third. Ketik: filter third' },
    { name: 'find_by_season', examples: ['show 1993-94', '1999-00'], examples_id: ['musim 93/94', 'musim 99/00'], response: 'Type: season <yyyy-yy>', response_id: 'Ketik: season <yyyy-yy>' },
    { name: 'find_by_year_single', examples: ['show 2010', 'year 2018'], examples_id: ['tahun 2010', 'tahun 2018'], response: 'Type: year <yyyy>', response_id: 'Ketik: year <yyyy>' },
  
    // SIZING / FIT / POLICIES
    { name: 'size_chart', examples: ['size chart', 'ukuran'], examples_id: ['panduan ukuran'], response: 'Most PUMA Milan jerseys run true-to-size; Player Issue fits tighter. Type: size', response_id: 'PUMA Milan umumnya true-to-size; Player Issue lebih ketat. Ketik: size' },
    { name: 'stock_check', examples: ['is it in stock?', 'ready stock?'], examples_id: ['stok ada?'], response: 'Tell me the product name or slug to check availability.', response_id: 'Sebutkan nama produk atau slug untuk cek ketersediaan.' },
    { name: 'payment_methods', examples: ['payment options', 'pay with gopay?'], examples_id: ['bisa gopay?'], response: 'We accept bank transfer, cards, GoPay/OVO, and PayPal (int’l).', response_id: 'Kami terima transfer bank, kartu, GoPay/OVO, dan PayPal (internasional).' },
    { name: 'shipping_eta', examples: ['how long shipping', 'kapan sampai'], examples_id: ['estimasi pengiriman'], response: 'Domestic 2–5 days; international 7–14 days.', response_id: 'Dalam negeri 2–5 hari; luar negeri 7–14 hari.' },
    { name: 'returns', examples: ['return policy', 'refund'], examples_id: ['retur', 'refund'], response: '7-day returns for non match-worn if tags intact.', response_id: 'Retur 7 hari untuk non match-worn jika tag utuh.' },
    { name: 'care', examples: ['how to wash', 'care tips'], examples_id: ['cara mencuci'], response: 'Cold wash inside-out; avoid dryer; don’t iron prints.', response_id: 'Cuci dingin sisi dalam keluar; hindari pengering; jangan setrika sablon.' },
  
    // QUICK SEARCH COMMAND HINTS
    { name: 'help_commands', examples: ['help', 'what can I type'], examples_id: ['bantuan', 'perintah apa'], response: 'Try: latest | filter home/away/third/pi/mw/90s/off | season 93-94 | price <1m/1-2m/premium | size', response_id: 'Coba: latest | filter home/away/third/pi/mw/90s/off | season 93-94 | price <1m/1-2m/premium | size' },
  
    // BRAND/CLUB TRIVIA (AC MILAN quick answers)
    { name: 'acmilan_titles', examples: ['how many serie a', 'scudetti'], examples_id: ['berapa kali juara liga'], response: 'AC Milan has 19 Serie A titles.', response_id: 'AC Milan juara Serie A 19 kali.' },
    { name: 'acmilan_ucl', examples: ['how many ucl', 'european cups'], examples_id: ['berapa kali ucl'], response: '7 UEFA Champions League titles.', response_id: '7 gelar Liga Champions.' },
    { name: 'acmilan_stadium', examples: ['what stadium', 'home ground'], examples_id: ['stadion apa'], response: 'San Siro (Giuseppe Meazza), Milan.', response_id: 'San Siro (Giuseppe Meazza), Milan.' },
    { name: 'acmilan_collab_offwhite', examples: ['off-white milan'], examples_id: ['off-white milan'], response: 'Fashion collab with Off-White since 2022.', response_id: 'Kolaborasi fashion dengan Off-White sejak 2022.' },
  ];
  