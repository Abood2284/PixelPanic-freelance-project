import os
import json
import re
import cloudinary
import cloudinary.uploader
import cloudinary.api

def upload_scraped_images():
    """
    Scans local brand folders, uploads images to Cloudinary, saves the URLs to a
    JSON file, and deletes the local file upon successful upload.
    """
    # --- 1. Configure Cloudinary ---
    # The script will use the credentials you provided.
    try:
        cloudinary.config(
            cloud_name="dzck9qets",
            api_key="265152241569196",
            api_secret="vC25HFldypZRYdbr7c7IRJDjMbA",
            secure=True
        )
        print("✅ Cloudinary configuration successful.")
    except Exception as e:
        print(f"❌ Error configuring Cloudinary: {e}")
        return

    # --- 2. Setup ---
    # The name of the output file that will store our structured data.
    output_json_file = 'uploaded_media.json'
    
    # List of directories to ignore.
    ignore_dirs = {'__pycache__', '.venv', '.git'}
    
    # Load existing data if the JSON file already exists, otherwise start fresh.
    uploaded_data = []
    if os.path.exists(output_json_file):
        with open(output_json_file, 'r') as f:
            uploaded_data = json.load(f)
        print(f"Loaded {len(uploaded_data)} existing records from '{output_json_file}'.")

    # --- 3. Find Brand Folders and Upload ---
    # Get a list of all items in the current directory.
    all_items = os.listdir('.')
    # Filter this list to only include directories that are not in our ignore list.
    brand_folders = [item for item in all_items if os.path.isdir(item) and item not in ignore_dirs]

    if not brand_folders:
        print("❌ No brand folders found. Make sure folders like 'Apple' are in the same directory as this script.")
        return

    print(f"Found brand folders: {', '.join(brand_folders)}")

    # Loop through each brand folder.
    for brand in brand_folders:
        folder_path = os.path.join('.', brand)
        print(f"\n--- Processing folder: {brand} ---")
        
        # List all files in the current brand folder.
        for filename in os.listdir(folder_path):
            # Check for common image file extensions, now including .avif
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif')):
                file_path = os.path.join(folder_path, filename)

                try:
                    # --- 4. Upload to Cloudinary ---
                    # The 'public_id' is the name of the file without the extension.
                    # The 'folder' argument organizes uploads within Cloudinary.
                    public_id = os.path.splitext(filename)[0]
                    
                    print(f"Uploading '{filename}' to Cloudinary folder '{brand}'...")
                    
                    upload_result = cloudinary.uploader.upload(
                        file_path,
                        folder=brand,
                        public_id=public_id,
                        overwrite=True # Overwrite if a file with the same name exists
                    )

                    # --- 5. Save Data and Clean Up ---
                    if upload_result and 'secure_url' in upload_result:
                        secure_url = upload_result['secure_url']
                        model_name = " ".join(public_id.replace('-', ' ').split()).title()

                        # Add the new data to our list.
                        uploaded_data.append({
                            "brand": brand,
                            "model": model_name,
                            "imageUrl": secure_url
                        })
                        
                        # Write the updated list back to the JSON file immediately.
                        with open(output_json_file, 'w') as f:
                            json.dump(uploaded_data, f, indent=2)
                        
                        print(f"  -> Success! URL: {secure_url}")
                        
                        # Delete the local file ONLY after a successful upload and JSON write.
                        os.remove(file_path)
                        print(f"  -> Deleted local file: '{file_path}'")

                except Exception as e:
                    print(f"  -> ❌ FAILED to upload '{filename}'. Error: {e}")
                    print("     Skipping deletion. You can re-run the script later.")

    print("\n✅ All folders processed. Uploads complete.")
    print(f"Data saved to '{output_json_file}'.")


# --- Run the main function ---
if __name__ == "__main__":
    upload_scraped_images()
