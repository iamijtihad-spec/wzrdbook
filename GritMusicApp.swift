import SwiftUI

@main
struct GritMusicApp: App {
    @StateObject private var phantomService = PhantomWalletService.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    // Handle deep link callbacks from Phantom
                    phantomService.handleCallback(url: url)
                }
        }
    }
}
