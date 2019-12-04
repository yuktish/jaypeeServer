const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		unique: true
	},
	products: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
	}],
	}, {
	usePushEach: true
});

var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;
