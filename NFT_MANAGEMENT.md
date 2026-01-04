# NFT Management System

## Overview

This project uses a centralized configuration system for managing NFTs. All NFT data is stored in `config/nfts.json` and dynamically loaded by the frontend, backend, and scripts.

## Quick Start

### Adding a New NFT

Use the automated script to create and configure a new NFT in one command:

```bash
node scripts/add_new_nft.js \
  --title "SONG NAME" \
  --audio "path/to/song.wav" \
  --image "path/to/cover.png" \
  --price 100 \
  --rarity "Common"
```

This will automatically:
1. ✅ Upload image to R2
2. ✅ Upload audio to R2
3. ✅ Generate metadata JSON
4. ✅ Upload metadata to R2
5. ✅ Mint NFT with metadata
6. ✅ Update `config/nfts.json`

**No manual code updates needed!** The frontend and backend will automatically pick up the new NFT.

### Environment Variables Required

For R2 uploads, set these in your `.env.local`:

```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

## Architecture

### Configuration File

**`config/nfts.json`** - Single source of truth for all NFT data:

```json
{
  "tracks": [
    {
      "title": "SONG NAME",
      "mint": "MintAddressHere...",
      "price": 100,
      "rarity": "Common",
      "metadataFile": "song_name.json",
      "imageFile": "song_name_cd.png",
      "audioFile": "SONG NAME.wav",
      "symbol": "WZRD"
    }
  ]
}
```

### Utility Functions

**`lib/nft-config.ts`** - Helper functions for loading config:

- `getAllTracks()` - Get all NFT tracks
- `getTrackMints()` - Get title → mint address map
- `getNFTPrices()` - Get mint → price map
- `getTrackByMint(mint)` - Find track by mint address
- `getTrackByTitle(title)` - Find track by title

### Usage in Code

**Frontend (app/page.tsx):**
```typescript
import { getTrackMints } from "@/lib/nft-config";
const TRACK_MINTS = getTrackMints();
```

**Backend (app/api/nfts/claim/route.ts):**
```typescript
import { getNFTPrices } from "@/lib/nft-config";
const NFT_PRICES = getNFTPrices();
```

**Scripts:**
```javascript
const config = require("../config/nfts.json");
const tracks = config.tracks;
```

## Benefits

✅ **No Manual Updates** - Add NFTs with a single command  
✅ **Consistent Data** - Single source of truth across all systems  
✅ **Easy Maintenance** - Update one file instead of many  
✅ **Type Safety** - TypeScript interfaces for config structure  
✅ **Scalable** - Easily add hundreds of NFTs  

## File Structure

```
config/
  └── nfts.json              # Central NFT configuration
lib/
  └── nft-config.ts          # Config loader utilities
scripts/
  └── add_new_nft.js         # Automated NFT creation
app/
  ├── page.tsx               # Frontend (uses config)
  └── api/nfts/claim/
      └── route.ts           # Backend API (uses config)
```

## Migration Notes

The system has been migrated from hardcoded values to centralized config:

- ✅ `TRACK_MINTS` in `app/page.tsx` → `getTrackMints()`
- ✅ `NFT_PRICES` in `app/api/nfts/claim/route.ts` → `getNFTPrices()`
- ✅ Track data in scripts → `config/nfts.json`

All existing NFTs have been added to the config file.
