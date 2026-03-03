// DOM Elements
const richTextItems = document.querySelectorAll('.rich-text');
// Styling loop
richTextItems.forEach(item => {
  // Check if the item contains a Quote Block
  const quoteBlocks = item.querySelectorAll('blockquote');
    if (quoteBlocks.length > 0) {
        // Apply alternate styling to the Quote Block
        quoteBlocks.forEach((quote, index) => {
            if (index % 2 === 0) {
                quote.style.backgroundColor = '#f0f0f0';
                quote.style.padding = '20px';
                quote.style.margin = '10px 0';
            } else {
                quote.style.backgroundColor = '#e0e0e0';
                quote.style.padding = '20px';
                quote.style.margin = '10px 0';
            }
        });
    }
});
