// Quick test for card mappings
function testCardMapping() {
  // Simulate the card mapping function logic for El Cazo fantasy
  const cardName = "El Cazo";
  const deckThemeId = "fantasy";
  
  // Generate the standard filename format
  let standardFilename = cardName.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")  // Remove accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
  
  const expectedPath = `/custom-cards/fantasy-theme/${standardFilename}-fantasy.png`;
  
  console.log('Card Name:', cardName);
  console.log('Theme:', deckThemeId);
  console.log('Standard Filename:', standardFilename);
  console.log('Expected Path:', expectedPath);
  console.log('Should resolve to: el-cazo-fantasy.png');
}

testCardMapping();
