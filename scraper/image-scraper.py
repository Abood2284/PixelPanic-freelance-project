import os
import re
import requests
from bs4 import BeautifulSoup

def scrape_brand_images():
    """
    Parses multiple local HTML files for different brands to find, download,
    and save product model images into brand-specific folders.
    """
    # --- 1. Setup ---
    # Define the list of HTML files to read from.
    # Add all your brand HTML filenames to this list.
    # The script will derive the brand name from the filename
    # (e.g., 'samsung_page.html' -> 'Samsung' folder).
    brand_html_files = [
        'apple_page.html',
        'samsung_page.html',
        'xiaomi_page.html',
        'vivo_page.html',
        'oneplus_page.html',
        'oppo_page.html',
        'google_page.html',
        'realme_page.html',
        'motorola_page.html',
        'iqoo_page.html',
        'poco_page.html',
        'tecno_page.html',
        'nothing_page.html',
        'nokia_page.html',
        'honor_page.html',
        'asus_page.html',
        # 'samsung_page.html', # Example: Add your other brand files here
        # 'oneplus_page.html', # Example
    ]

    # --- 2. Loop Through Each Brand File ---
    for html_file in brand_html_files:
        # Derive the brand name from the filename for the output folder.
        # It takes the part before '_page.html' and capitalizes it.
        try:
            brand_name = html_file.split('_page.html')[0].capitalize()
            output_folder = brand_name
        except IndexError:
            print(f"Skipping '{html_file}' due to unexpected filename format. Expected format: 'brandname_page.html'")
            continue

        print(f"\n--- Processing brand: {brand_name} ---")

        # Create the brand-specific output folder if it doesn't exist.
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
            print(f"Created directory: '{output_folder}'")

        # --- 3. Read and Parse HTML ---
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except FileNotFoundError:
            print(f"Error: The file '{html_file}' was not found. Skipping this brand.")
            continue # Move to the next file in the list.

        soup = BeautifulSoup(html_content, 'html.parser')

        # --- 4. Find and Download Images ---
        product_blocks = soup.find_all('div', class_='select_product_list_blk')

        if not product_blocks:
            print(f"No product blocks found for {brand_name}. Check the HTML structure.")
            continue

        print(f"Found {len(product_blocks)} models for {brand_name}. Starting download...")

        for block in product_blocks:
            img_tag = block.find('img', class_='product-image')
            
            if img_tag:
                img_url = img_tag.get('src')
                model_name = img_tag.get('alt')

                if not img_url or not model_name:
                    print("Skipping an item with a missing image URL or model name.")
                    continue
                
                try:
                    # --- 5. Create a Clean Filename ---
                    filename_base = model_name.lower().replace(' ', '-')
                    filename_base = re.sub(r'[^a-z0-9-]', '', filename_base)
                    
                    file_extension = os.path.splitext(img_url)[1]
                    if not file_extension:
                        file_extension = '.webp'

                    filename = f"{filename_base}{file_extension}"
                    filepath = os.path.join(output_folder, filename)

                    # --- 6. Download and Save the Image ---
                    print(f"Downloading '{model_name}' -> '{filename}'...")
                    response = requests.get(img_url, stream=True)
                    
                    if response.status_code == 200:
                        with open(filepath, 'wb') as f:
                            for chunk in response.iter_content(8192):
                                f.write(chunk)
                    else:
                        print(f"Failed to download {img_url}. Status code: {response.status_code}")

                except requests.exceptions.RequestException as e:
                    print(f"Error downloading {img_url}: {e}")
                except Exception as e:
                    print(f"An unexpected error occurred for '{model_name}': {e}")

    print(f"\n✅ All processing complete!")

# --- Run the main function ---
if __name__ == "__main__":
    scrape_brand_images()
