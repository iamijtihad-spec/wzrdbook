# Info.plist Configuration for Phantom Wallet

Add these entries to your `Info.plist` file in Xcode:

## 1. URL Scheme for Callback

Right-click on `Info.plist` → Open As → Source Code

Add this inside the `<dict>` tag:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>gritmusic</string>
        </array>
        <key>CFBundleURLName</key>
        <string>io.gritcoin.music</string>
    </dict>
</array>
```

## 2. Query Schemes (Allow Opening Phantom)

Add this:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>phantom</string>
</array>
```

## Complete Info.plist Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Existing keys... -->
    
    <!-- Add these for Phantom integration -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>gritmusic</string>
            </array>
            <key>CFBundleURLName</key>
            <string>io.gritcoin.music</string>
        </dict>
    </array>
    
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>phantom</string>
    </array>
</dict>
</plist>
```

## How to Add in Xcode

1. Open your project in Xcode
2. Select the `GritMusic` target
3. Go to the **Info** tab
4. Under **URL Types**, click **+** to add a new URL type
   - **Identifier**: `io.gritcoin.music`
   - **URL Schemes**: `gritmusic`
5. Under **Custom iOS Target Properties**, add:
   - Key: `LSApplicationQueriesSchemes`
   - Type: Array
   - Add item: `phantom`

After adding these, rebuild the app and the Phantom integration will work!
