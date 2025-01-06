import os
import argparse

def create_mindmap(domains, output_file):
    domain_map = {}
    for domain in domains:
        parts = domain.split('.')
        current_level = domain_map
        for part in reversed(parts):
            if part not in current_level:
                current_level[part] = {}
            current_level = current_level[part]

    def generate_markdown(node, level=0):
        """Recursively generate Markdown for the mindmap."""
        markdown = ""
        for key, sub_node in node.items():
            markdown += f"{'  ' * level}- {key}\n"
            markdown += generate_markdown(sub_node, level + 1)
        return markdown

    markdown_content = generate_markdown(domain_map)

    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(markdown_content)

    print(f"Mindmap saved to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Generate a Markdown mindmap from a list of domains.")
    parser.add_argument("input_file", help="Path to the input file containing a list of domains (one per line).")
    parser.add_argument("output_file", help="Path to save the generated Markdown file.")

    args = parser.parse_args()

    if not os.path.exists(args.input_file):
        print(f"Error: The file '{args.input_file}' does not exist.")
        exit(1)

    with open(args.input_file, 'r', encoding='utf-8') as file:
        domains = [line.strip() for line in file if line.strip()]

    create_mindmap(domains, args.output_file)

if __name__ == "__main__":
    main()
