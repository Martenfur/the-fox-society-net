const fs = require('fs');
const path = require('path');

// Helper to recursively get all .html files in a directory
function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getHtmlFiles(filePath));
        } else if (filePath.endsWith('.html')) {
            results.push(filePath);
        }
    });

    return results;
}

// Load and flatten all templates into a dictionary
function loadTemplates(templatesDir) {
    const templates = {};
    const templateFiles = getHtmlFiles(templatesDir);

    templateFiles.forEach(filePath => {
        const name = path.basename(filePath, '.html');
        const content = fs.readFileSync(filePath, 'utf8')
            .replace(/\s+/g, ' ')    // Collapse whitespace
            .trim();                 // Remove leading/trailing space
        templates[name] = content;
    });

    return templates;
}

// Replace {{template_name}} with actual template HTML
function applyTemplates(content, templates) {
    return content.replace(/{{\s*(\w+)\s*}}/g, (match, name) => {
        return templates[name] || match;
    });
}

// Write processed HTML to the corresponding location in /out
function processPages(pagesDir, outDir, templates) {
    const htmlFiles = getHtmlFiles(pagesDir);

    htmlFiles.forEach(filePath => {
        const relativePath = path.relative(pagesDir, filePath);
        const outputPath = path.join(outDir, relativePath);

        const content = fs.readFileSync(filePath, 'utf8');
        const result = applyTemplates(content, templates);

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, result, 'utf8');
        console.log(`Processed: ${relativePath}`);
    });
}

// Main
function main() {
    const templatesDir = path.join(__dirname, 'src/templates');
    const pagesDir = path.join(__dirname, 'src/pages');
    const outputDir = path.join(__dirname, '');

    const templates = loadTemplates(templatesDir);
    processPages(pagesDir, outputDir, templates);

    console.log('Done. Output written to /out');
}

main();