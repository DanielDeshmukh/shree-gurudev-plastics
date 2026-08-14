import os
import sys
import json
import csv


class ManualRenamer:
    def __init__(self, output_dir="output"):
        self.output_dir = output_dir

    def list_brands(self):
        if not os.path.exists(self.output_dir):
            return []
        return [d for d in os.listdir(self.output_dir)
                if os.path.isdir(os.path.join(self.output_dir, d))]

    def list_files(self, brand_name, filter_unknown=False):
        brand_dir = os.path.join(self.output_dir, brand_name)
        if not os.path.exists(brand_dir):
            return []

        files = sorted(os.listdir(brand_dir))
        if filter_unknown:
            files = [f for f in files if "unknown" in f.lower()]
        return files

    def rename_file(self, brand_name, old_name, new_name):
        brand_dir = os.path.join(self.output_dir, brand_name)

        if not new_name.endswith('.png'):
            new_name += '.png'

        old_path = os.path.join(brand_dir, old_name)
        new_path = os.path.join(brand_dir, new_name)

        if not os.path.exists(old_path):
            print(f"  Error: {old_name} not found")
            return False

        if os.path.exists(new_path):
            print(f"  Error: {new_name} already exists")
            return False

        os.rename(old_path, new_path)
        print(f"  Renamed: {old_name} -> {new_name}")
        return True

    def batch_rename_from_csv(self, brand_name, csv_path):
        brand_dir = os.path.join(self.output_dir, brand_name)

        if not os.path.exists(csv_path):
            print(f"CSV file not found: {csv_path}")
            return 0

        renamed = 0
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                old_name = row.get('old_name', '')
                new_name = row.get('new_name', '')

                if old_name and new_name:
                    if self.rename_file(brand_name, old_name, new_name):
                        renamed += 1

        print(f"\nBatch renamed {renamed} files")
        return renamed

    def interactive_rename(self, brand_name):
        print(f"\nInteractive Rename Mode: {brand_name}")
        print("=" * 50)

        files = self.list_files(brand_name)
        if not files:
            print("No files found.")
            return

        while True:
            print(f"\nFiles ({len(files)} total):")
            for i, f in enumerate(files):
                marker = " [?]" if "unknown" in f.lower() else ""
                print(f"  {i + 1:3d}. {f}{marker}")

            print("\nCommands:")
            print("  <number>     - Rename file at that position")
            print("  u            - Show only unknown files")
            print("  a            - Show all files")
            print("  s <text>     - Search files containing text")
            print("  q            - Quit")

            choice = input("\n> ").strip()

            if choice == 'q':
                break
            elif choice == 'u':
                files = self.list_files(brand_name, filter_unknown=True)
                print(f"\nShowing {len(files)} unknown files")
                continue
            elif choice == 'a':
                files = self.list_files(brand_name)
                continue
            elif choice.startswith('s '):
                search = choice[2:].lower()
                all_files = self.list_files(brand_name)
                files = [f for f in all_files if search in f.lower()]
                print(f"\nFound {len(files)} files matching '{search}'")
                continue

            try:
                idx = int(choice) - 1
                if 0 <= idx < len(files):
                    new_name = input(f"  New name for {files[idx]}: ").strip()
                    if new_name:
                        if self.rename_file(brand_name, files[idx], new_name):
                            files[idx] = new_name + '.png' if not new_name.endswith('.png') else new_name
                else:
                    print("  Invalid number")
            except ValueError:
                print("  Invalid input")

    def export_file_list(self, brand_name, export_path=None):
        files = self.list_files(brand_name)

        if export_path is None:
            export_path = f"{brand_name}_files.csv"

        with open(export_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['filename', 'needs_review'])
            for file in files:
                writer.writerow([file, 'unknown' in file.lower()])

        print(f"Exported {len(files)} files to {export_path}")
        return export_path

    def generate_template_csv(self, brand_name, template_path=None):
        files = self.list_files(brand_name, filter_unknown=True)

        if template_path is None:
            template_path = f"{brand_name}_rename_template.csv"

        with open(template_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['old_name', 'new_name'])
            for file in files:
                writer.writerow([file, ''])

        print(f"Generated template with {len(files)} files to rename: {template_path}")
        return template_path


if __name__ == "__main__":
    renamer = ManualRenamer("output")

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python manual_rename.py list                    - List brands")
        print("  python manual_rename.py files <brand>           - List files")
        print("  python manual_rename.py rename <brand>          - Interactive rename")
        print("  python manual_rename.py csv <brand>             - Export to CSV")
        print("  python manual_rename.py template <brand>        - Generate rename template")
        print("  python manual_rename.py batch <brand> <csv>     - Batch rename from CSV")
        sys.exit(0)

    command = sys.argv[1]

    if command == "list":
        brands = renamer.list_brands()
        print("Brands found:")
        for b in brands:
            count = len(renamer.list_files(b))
            print(f"  - {b} ({count} files)")

    elif command == "files" and len(sys.argv) > 2:
        brand = sys.argv[2]
        files = renamer.list_files(brand)
        print(f"\nFiles in {brand}:")
        for i, f in enumerate(files):
            print(f"  {i + 1}. {f}")

    elif command == "rename" and len(sys.argv) > 2:
        renamer.interactive_rename(sys.argv[2])

    elif command == "csv" and len(sys.argv) > 2:
        renamer.export_file_list(sys.argv[2])

    elif command == "template" and len(sys.argv) > 2:
        renamer.generate_template_csv(sys.argv[2])

    elif command == "batch" and len(sys.argv) > 3:
        renamer.batch_rename_from_csv(sys.argv[2], sys.argv[3])

    else:
        print("Invalid command. Run without arguments for help.")
