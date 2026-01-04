import SwiftUI

struct WalletView: View {
    @ObservedObject var viewModel: LibraryViewModel
    @ObservedObject var phantomService = PhantomWalletService.shared
    @State private var addressInput: String = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "wallet.pass.fill")
                .font(.system(size: 60))
                .foregroundColor(.purple)
            
            Text("Connect Wallet")
                .font(.title)
                .bold()
            
            // Phantom Wallet Connection
            if !phantomService.isConnected {
                VStack(spacing: 15) {
                    Text("Connect with Phantom for the best experience")
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                    
                    Button(action: {
                        phantomService.connect()
                    }) {
                        HStack {
                            Image(systemName: "link")
                            Text("Connect Phantom Wallet")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [Color.purple, Color.blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    
                    if let error = phantomService.connectionError {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding()
                    }
                    
                    Divider()
                        .padding(.vertical)
                    
                    Text("Or enter address manually")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Manual Address Input (fallback)
            if !phantomService.isConnected {
                TextField("Wallet Address", text: $addressInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                    .autocapitalization(.none)
                
                Button(action: {
                    viewModel.connectWallet(address: addressInput)
                }) {
                    Text("Connect Manually")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
            }
            
            // Connected State
            if phantomService.isConnected, let address = phantomService.connectedAddress {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Connected via Phantom")
                            .font(.headline)
                    }
                    
                    Text(address)
                        .font(.caption2)
                        .lineLimit(1)
                        .truncationMode(.middle)
                    
                    Divider()
                    
                    Text("Owned NFTs: \(viewModel.ownedMints.count)")
                        .font(.headline)
                    
                    Button(action: {
                        phantomService.disconnect()
                        viewModel.connectWallet(address: "")
                    }) {
                        Text("Disconnect")
                            .font(.headline)
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(UIColor.secondarySystemBackground))
                            .cornerRadius(12)
                    }
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(12)
                .padding()
            } else if !viewModel.walletAddress.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Connected (Manual):")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(viewModel.walletAddress)
                        .font(.caption2)
                        .lineLimit(1)
                        .truncationMode(.middle)
                    
                    Divider()
                    
                    Text("Owned NFTs: \(viewModel.ownedMints.count)")
                        .font(.headline)
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(12)
                .padding()
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Wallet")
        .onChange(of: phantomService.connectedAddress) { _, newAddress in
            if let address = newAddress {
                viewModel.connectWallet(address: address)
            }
        }
    }
}
