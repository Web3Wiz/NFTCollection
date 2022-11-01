export default function handler(req, res) {

    const tokenId = req.query.tokenId;
    const imageUrl = "https://github.com/Web3Wiz/NFTCollection/tree/main/nextapp/public/cryptodevs/";


    res.status(200).json({
        name: 'Crypto Dev #' + tokenId,
        description: "Crypto Dev is a NFT collection for developers in Crypto",
        image: imageUrl + tokenId + ".svg"
    })
}
