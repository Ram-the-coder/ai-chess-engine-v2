module.exports = {
	entry: {
		main: "./src/index.js"
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: ["html-loader"]
			}, 
			{
				test: /\.(svg|png|jpg|gif)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "img"
					}
					
				}
			}, 
			{
				test: /\.mp3$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "sounds"
					}
				}
			}
		]
	}
};