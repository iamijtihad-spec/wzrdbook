
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../');

function scanDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'test-ledger') {
                scanDir(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function audit() {
    console.log("Starting Audit...");
    const files = scanDir(ROOT_DIR);
    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    console.log(`Scanned ${files.length} files (${tsFiles.length} TypeScript).`);

    // Basic heuristic: Find files not imported by others
    // limiting scope to 'app' and 'components'
    const appDir = path.join(ROOT_DIR, 'app');
    const componentsDir = path.join(ROOT_DIR, 'components');

    const targets = files.filter(f => f.startsWith(appDir) || f.startsWith(componentsDir));

    // Naive usage check
    targets.forEach(target => {
        const basename = path.basename(target, path.extname(target));
        if (basename === 'page' || basename === 'layout' || basename === 'route') return; // Next.js specifics

        // Check if basename is mentioned in any other file
        let used = false;
        for (const file of tsFiles) {
            if (file === target) continue;
            const content = fs.readFileSync(file, 'utf-8');
            if (content.includes(basename)) {
                used = true;
                break;
            }
        }

        if (!used) {
            console.log(`[PASSIVE] Potential Unused File: ${path.relative(ROOT_DIR, target)}`);
        }
    });

    console.log("Audit Complete.");
}

audit();
