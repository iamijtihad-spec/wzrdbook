import Foundation
import Combine

class PhantomWalletService: ObservableObject {
    static let shared = PhantomWalletService()
    
    @Published var connectedAddress: String?
    @Published var isConnected: Bool = false
    @Published var connectionError: String?
    
    private let phantomScheme = "phantom://v1/connect"
    private let appScheme = "gritmusic"
    
    func connect() {
        guard let url = buildConnectURL() else {
            connectionError = "Failed to build connection URL"
            return
        }
        
        // Check if Phantom is installed
        if UIApplication.shared.canOpenURL(URL(string: "phantom://")!) {
            UIApplication.shared.open(url)
        } else {
            connectionError = "Phantom wallet is not installed. Please install it from the App Store."
        }
    }
    
    func disconnect() {
        connectedAddress = nil
        isConnected = false
    }
    
    func handleCallback(url: URL) {
        guard url.scheme == appScheme else { return }
        
        // Parse the callback URL
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        
        // Look for the address parameter
        if let address = components?.queryItems?.first(where: { $0.name == "phantom_encryption_public_key" })?.value {
            connectedAddress = address
            isConnected = true
            connectionError = nil
        } else if let errorMsg = components?.queryItems?.first(where: { $0.name == "errorMessage" })?.value {
            connectionError = errorMsg
        }
    }
    
    private func buildConnectURL() -> URL? {
        var components = URLComponents(string: phantomScheme)
        components?.queryItems = [
            URLQueryItem(name: "app_url", value: "https://gritcoin.io"),
            URLQueryItem(name: "dapp_encryption_public_key", value: generateDappPublicKey()),
            URLQueryItem(name: "redirect_link", value: "\(appScheme)://connected"),
            URLQueryItem(name: "cluster", value: "devnet")
        ]
        return components?.url
    }
    
    private func generateDappPublicKey() -> String {
        // For MVP, use a static key or generate a simple one
        // In production, this should be a proper Ed25519 public key
        return "GRIT_MUSIC_APP_KEY"
    }
}
