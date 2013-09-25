function showUploadedVideos(data) {
  var feed = data.feed;
  var entries = feed.entry || [];

  var templateData = {
    service: "youtube",
    items: []
  };

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var item = {
      url: entry.media$group.media$player.url,
      title: entry.title.$t,
      thumbnail: entry.media$group.media$thumbnail[1].url,
      description: entry.media$group.media$description.$t,
      viewCount: numberWithCommas(entry.yt$statistics.viewCount),
      timeDuration: entry.media$group.yt$duration.seconds,
      raw_uploadDate: entry.media$group.yt$uploaded.$t,
      uploadDate: moment(entry.media$group.yt$uploaded.$t).calendar(),
      likeCount: entry.yt$rating.numLikes || 0,
      dislikeCount: entry.yt$rating.numDislikes || 0
    };

    item.url = item.url.replace('&feature=youtube_gdata_player', '');

    var minutes = Math.floor(parseInt(item.timeDuration) / 60);
    var seconds = parseInt(item.timeDuration) - minutes * 60;
    item.timeDuration = minutes + ':' + seconds;

    var date =  new Date(item.raw_uploadDate);
    item.raw_uploadDate = date.toLocaleDateString();

    var totalVotes = parseInt(item.likeCount, 10) + parseInt(item.dislikeCount, 10);
    item.percentOfLikes    = 100 * (item.likeCount / totalVotes);
    item.percentOfDislikes = 100 *  (item.dislikeCount / totalVotes);
    templateData.items.push(item);
  }

  var templateMarkup = $("#youtube-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#main").append(template);
}


function showInstagramFeed(data) {
  var entries = data.data || [];

  var templateData = {
    service: "instagram",
    items: []
  };

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var item = {
      id: entry.id,
      image: entry.images.low_resolution.url,
      full_image: entry.images.standard_resolution.url,
      likes: entry.likes.count,
      filter: entry.filter || 'None',
      raw_created_time: new Date(1000 * entry.created_time),
      created_time: moment.unix(entry.created_time).calendar(),
      caption: jEmoji.unifiedToHTML(entry.caption.text),
      commentsCount: entry.comments.count
    };

    templateData.items.push(item);
  }

  var templateMarkup = $("#instagram-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#main").append(template);
}

function showTumblrPosts(data) {
  var feed = data.response;
  var blog = feed.blog;
  var posts = feed.posts || [];

  var templateData = {
    service: "tumblr",
    items: []
  };

  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var item = {
      url: post.post_url,
      type: post.type,
      raw_date: post.date,
      date: moment(Date(post.date)).calendar(),
      asking_name: post.asking_name,
      asking_url: post.askin_url,
      question: post.question,
      answer: post.answer,
      note_count: post.note_count,
      caption: post.caption,
      photos: []
    };

    if (item.answer) {
      var html = $.parseHTML(item.answer);
      item.answer = $(html).first().text();
    }


    if (post.photos && post.photos.length <= 1) {
      item.photo = post.photos[0].alt_sizes[2].url || '';
      item.original_size = post.photos[0].original_size.url || '';
    } else if (post.photos && post.photos.length > 1) {
      _.each(post.photos, function(photo) {
        item.photos.push({
          url: photo.alt_sizes.slice(-1)[0].url,
          original_size: photo.original_size.url
        });
      });
    }

    var temp_date = new Date(item.raw_date);
    item.raw_date = temp_date.toLocaleDateString();
    templateData.items.push(item);
  }

  var templateMarkup = $("#tumblr-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#main").append(template);
}

$.Isotope.prototype._getCenteredMasonryColumns = function() {
  this.width = this.element.width();

  var parentWidth = this.element.parent().width();

  // i.e. options.masonry && options.masonry.columnWidth
  var colW = this.options.masonry && this.options.masonry.columnWidth ||
    // or use the size of the first item
    this.$filteredAtoms.outerWidth(true) ||
    // if there's no items, use size of container
    parentWidth;

  var cols = Math.floor( parentWidth / colW );
  cols = Math.max( cols, 1 );

  // i.e. this.masonry.cols = ....
  this.masonry.cols = cols;
  // i.e. this.masonry.columnWidth = ...
  this.masonry.columnWidth = colW;
};

$.Isotope.prototype._masonryReset = function() {
  // layout-specific props
  this.masonry = {};
  // FIXME shouldn't have to call this again
  this._getCenteredMasonryColumns();
  var i = this.masonry.cols;
  this.masonry.colYs = [];
  while (i--) {
    this.masonry.colYs.push( 0 );
  }
};

$.Isotope.prototype._masonryResizeChanged = function() {
  var prevColCount = this.masonry.cols;
  // get updated colCount
  this._getCenteredMasonryColumns();
  return ( this.masonry.cols !== prevColCount );
};

$.Isotope.prototype._masonryGetContainerSize = function() {
  var unusedCols = 0,
    i = this.masonry.cols;
  // count unused columns
  while ( --i ) {
    if ( this.masonry.colYs[i] !== 0 ) {
      break;
    }
    unusedCols++;
  }

  return {
    height : Math.max.apply( Math, this.masonry.colYs ),
    // fit container to columns that have been used;
    width : (this.masonry.cols - unusedCols) * this.masonry.columnWidth
  };
};


$(function() {


  $('.instagram-link').magnificPopup({
    type:'image',
    removalDelay: 500,
    closeOnContentClick: true,
    mainClass: 'mfp-fade',
    image: {
      verticalFit: true
    }
  });

  $('.tumblr-link').magnificPopup({
    type:'image',
    removalDelay: 160,
    closeOnContentClick: true,
    mainClass: 'mfp-fade',
    image: {
      verticalFit: true
    }
  });

  $('.tumblr-gallery-link').magnificPopup({
    type:'image',
    removalDelay: 160,
    closeOnContentClick: true,
    mainClass: 'mfp-fade',
    image: {
      verticalFit: true
    },
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1]
    }
  });


  $('.popup-youtube').magnificPopup({
    disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: false
  });

  var $container = $('#main');
  var $imgs =  $("img.lazy");

  $imgs.lazyload({
    effect : "fadeIn",
    failure_limit: Math.max($imgs.length - 1, 0)
  });

  $container.imagesLoaded(function() {
    $container.isotope({
      itemSelector : '.thumbnail',
      getSortData : {
        date: function( $elem ) {
          return new Date($elem.find('.date').attr('data-date'));
        }
      },
      sortBy: 'date',
      sortAscending : false,
      onLayout: function() {
        $(window).trigger("scroll");
      }
    });
    $imgs.load(function () {
      $container.isotope('reLayout');
    });


    var $optionSets = $('#filters'),
      $optionLinks = $optionSets.find('a');

    $optionLinks.click(function(){
      var $this = $(this);
      if ($this.hasClass('selected'))  {
        return false;
      }
      var $optionSet = $this.parents('#filters');
      $optionSet.find('.selected').removeClass('selected');
      $this.addClass('selected');

      var options = {},
        key = $optionSet.attr('data-option-key'),
        value = $this.attr('data-option-value');

      value = value === 'false' ? false : value;
      options[ key ] = value;
      if ( key === 'layoutMode' && typeof changeLayoutMode === 'function' ) {
        changeLayoutMode( $this, options )
      } else {
        $container.isotope( options );
      }

      return false;
    });
  });
});

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}