
import fs from 'fs';
import path from 'path';

function addEdgeRuntime(dir: string) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addEdgeRuntime(filePath);
    } else if (file === 'route.ts') {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes("export const runtime = 'edge'")) {
            console.log(`Updating ${filePath}`);
            const newContent = `${content}\n\nexport const runtime = 'edge';`;
            fs.writeFileSync(filePath, newContent);
        }
    }
  });
}

addEdgeRuntime('./app/api');
