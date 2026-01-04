import fs from 'fs';
import path from 'path';

export interface LocalTrack {
    title: string;
    mint: string;
    price: number;
    rarity: string;
    metadataFile: string;
    imageFile: string;
    audioFile: string;
    symbol: string;
    isLocal: boolean;
}

export function scanLocalAudio(): LocalTrack[] {
    const musicDir = path.join(process.cwd(), 'music_uploads');

    if (!fs.existsSync(musicDir)) return [];

    const files = fs.readdirSync(musicDir);
    const audioFiles = files.filter(f => f.endsWith('.wav') || f.endsWith('.mp3'));

    return audioFiles.map((file, index) => {
        const title = file.replace(/\.(wav|mp3)$/i, ''); // Remove extension

        return {
            title: title,
            mint: `local-${index}-${title.replace(/\s+/g, '-')}`, // Fake mint
            price: 0,
            rarity: "Upload",
            metadataFile: "",
            imageFile: "wzrd_cd.png", // Valid default from public/images
            audioFile: file,
            symbol: "GRIT-UPLOAD",
            isLocal: true
        };
    });
}
