angular.module('directive.LiBerry', [])
	.directive('liBerry', function($timeout, $rootScope){
		return{
			scope: {
			books: '='
			},
			templateUrl: 'app/LiBerry/LiBerry.html',
			link: function(scope, $elm, attrs){
				$timeout(function(){

// INIT LIBERRY OBJECT
var LiBerry = {
	container: $('.lb-container'),
	shelf: $('.lb-shelf'),
	bookends: $('.lb-bookend'),
	books: $('.lb-book'),
	spines: $('.lb-spine'),
	clickedBook: null,

	params: {
		containerW: 0,
		shelfW: 0,
		bookendW: 0,
		bookW: 0,
		bookHoverW: 10,
		shelfLeftMargin: 0,
		browseView: true,
		isClicked: false,
		isAnimating: false,
		animSpeed: 600,
		mX: 0,
	},

	init: function(){
		LiBerry.arrangeShelf();
		LiBerry.bindUIEvents();
	},

	arrangeShelf: function(){
		LiBerry.params.shelfW = 0; //reset for window resizing
		LiBerry.params.bookW = parseInt($(LiBerry.books).outerWidth(true));
		LiBerry.params.bookendW = parseInt(LiBerry.bookends.css('width'));
		LiBerry.params.containerW = parseInt(LiBerry.container.css('width'));
		for(var i = 0; i < LiBerry.books.length; ++i){
			LiBerry.params.shelfW += LiBerry.params.bookW;
		}
		LiBerry.params.shelfW += 2 * LiBerry.params.bookendW;
		LiBerry.shelf.css({'width' : LiBerry.params.shelfW});
		LiBerry.params.shelfLeftMargin = LiBerry.params.containerW/2 - LiBerry.params.shelfW/2;
		LiBerry.shelf.css({'margin-left' : LiBerry.params.shelfLeftMargin});
		LiBerry.params.mX = window.innerWidth / 2;
	},

	bindUIEvents: function(){
		LiBerry.bindWindowResize();
		LiBerry.bindMouseEvent();
		LiBerry.bindHoverEvent();
		LiBerry.bindClickEvent(LiBerry.reMasonry);
	},

	bindWindowResize: function(){
		$(window).resize(function(e){
			if(!LiBerry.params.isClicked){
				LiBerry.arrangeShelf();
			}else{
				//we need to adjust elements based on the new window width
				//this is especially important for resizing content within lb-content
				LiBerry.params.containerW = LiBerry.container.width();
				LiBerry.shelf.css({'width' : LiBerry.params.containerW});
				if(LiBerry.clickedBook != null){
					LiBerry.clickedBook.css({'width' : LiBerry.params.containerW});
					LiBerry.calcContentHeight();
				}
			}
		});
	},

	bindMouseEvent: function(){
		$(window).mousemove(function(e) {
			if(!LiBerry.params.isAnimating){
				var mouseX = e.pageX;
				
			}

		});
	},

	bindHoverEvent: function(){	
		LiBerry.books.hover(function(e){
			if(!LiBerry.params.isAnimating){
				// console.log('Hovering and animating = ' + LiBerry.params.isAnimating );
				var hoverBook = $(this);
				if(!LiBerry.params.isClicked){
					$(hoverBook).hoverFlow(e.type,
						{'width': LiBerry.params.bookW + LiBerry.params.bookHoverW},
						300);
					$(LiBerry.shelf).hoverFlow(e.type,
						{'margin-left' : '-=' + (LiBerry.params.bookHoverW / 2).toString()}, 300);
				}
			}
		}, function(e){
			if(!LiBerry.params.isAnimating){
				var hoverBook = $(this);
				if(!LiBerry.params.isClicked){
					$(LiBerry.shelf).hoverFlow(e.type,
						{'margin-left' : '+=' + (LiBerry.params.bookHoverW / 2).toString()}, 300);
					$(hoverBook).hoverFlow(e.type,
						{'width': LiBerry.params.bookW}, 
						300);
					}
			}
		});
	},

	bindClickEvent: function(callback){
		LiBerry.spines.click(function(e){
			LiBerry.params.isAnimating = true;
			$('*').stop( true ); //stop all other animations
			LiBerry.params.isClicked = !LiBerry.params.isClicked;
			LiBerry.clickedBook = $(this).parent();
			var clickedBookIndex = LiBerry.clickedBook.data('order');
			if(LiBerry.params.isClicked){
				LiBerry.collapseShelf(clickedBookIndex);
			}else{ // return to shelfMode
				LiBerry.restoreShelf(clickedBookIndex);
			}
			LiBerry.calcContentHeight();
			callback(); // reMasonry
		});
	},

		collapseShelf: function(clickedBookIndex){
			// remove bookends
			$(LiBerry.bookends).animate({'width' : 0 }, LiBerry.params.animSpeed);
			//collapse other books
			for(var i = 0; i < LiBerry.books.length; ++i){
				if(clickedBookIndex !== i) $(LiBerry.books[i]).animate({ 'width' : 0 }, LiBerry.params.animSpeed);
			}

			LiBerry.clickedBook.animate({
				'width' : LiBerry.params.containerW,
				'margin' : '0' }, LiBerry.params.animSpeed, 'easeOutCubic');
			LiBerry.shelf.css({'width' : LiBerry.params.containerW * 1.4});
			LiBerry.shelf.animate({ 'margin-left' : 0 }, 1000, 'easeOutCubic');
		},

		restoreShelf: function(clickedBookIndex){
			//restore bookends
			$(LiBerry.bookends).animate({'width' : 80 }, LiBerry.params.animSpeed);
			//collapse other books
			for(var i = 0; i < LiBerry.books.length; ++i){
				if(clickedBookIndex !== i) $(LiBerry.books[i]).animate({ 'width' : 100 }, LiBerry.params.animSpeed);
			}

			LiBerry.clickedBook.animate({
				'width' : LiBerry.params.bookW,
				'margin' : '0' }, LiBerry.params.animSpeed, 'easeOutCubic');
			LiBerry.shelf.css({'width' : 'auto'});
			LiBerry.shelf.animate({ 'margin-left' : LiBerry.params.shelfLeftMargin }, 1000, 'easeOutCubic');
		},

	reMasonry: function(){
		LiBerry.params.isAnimating = false;
		if(LiBerry.params.isClicked){
			var reMasonry = setTimeout(function(){
				// broadcast forcing masonry to reload
				$rootScope.$broadcast('masonry.reload');
			}, 500);
		}
	},

	calcContentHeight: function(){
		contentHeight = LiBerry.clickedBook.find('.lb-content').height();
		LiBerry.container.animate({
			'height' : LiBerry.params.isClicked ?
			((contentHeight == 0) ? '400px' : contentHeight) : '400px'},
			500, 'easeOutCubic');
	}};
					LiBerry.init();       	
				});
			}
		};
	});

$.extend($.easing, {
	def: 'easeOutCubic',
	easeInCubic: function (x, t, b, c, d) {return c*(t/=d)*t*t + b;},
	easeOutCubic: function (x, t, b, c, d) {return c*((t=t/d-1)*t*t + 1) + b;}
});
