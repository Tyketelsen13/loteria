export async function generateImagineArtCard(prompt: string, apiKey: string): Promise<string | null> {
  try {
    // Use the correct Imagine Art API endpoint
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', 'cartoon');
    formData.append('aspect_ratio', '1:1');

    const response = await fetch("https://api.vyro.ai/v2/image/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (response.ok) {
      // The API returns a binary image file
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log("ImagineArt API success: Generated image");
      return imageUrl;
    } else {
      const errorText = await response.text();
      console.error("ImagineArt API error:", response.status, errorText);
    }
  } catch (error) {
    console.error("ImagineArt API request failed:", error);
  }

  // Fallback: Generate a colorful avatar using a placeholder service
  // This creates unique, Mexican-style colored avatars
  const colors = ['e1b866', 'b89c3a', '8c2f2b', 'd4a574', 'c49158', '9a2e2a'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const seed = Math.random().toString(36).substring(7);
  
  // Use a service that generates nice avatars - this one creates geometric patterns
  return `https://ui-avatars.com/api/?name=Loteria+Player&size=200&background=${randomColor}&color=ffffff&font-size=0.33&format=png&seed=${seed}`;
}
