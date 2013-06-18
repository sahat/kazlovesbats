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
      viewCount: entry.yt$statistics.viewCount,
      timeDuration: entry.media$group.yt$duration.seconds,
      raw_uploadDate: entry.media$group.yt$uploaded.$t,
      uploadDate: moment(entry.media$group.yt$uploaded.$t).calendar(),
      likeCount: entry.yt$rating.numLikes,
      dislikeCount: entry.yt$rating.numDislikes
    };

    var minutes = Math.floor(parseInt(item.timeDuration) / 60);
    var seconds = parseInt(item.timeDuration) - minutes * 60;
    item.timeDuration = minutes + ':' + seconds;

    var date =  new Date(item.raw_uploadDate);
    item.raw_uploadDate = date.toLocaleDateString();

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
      caption: post.caption
    };
    if (post.photos) {
      item.photo = post.photos[0].alt_sizes[2].url || ''
    }

    var temp_date = new Date(item.raw_date);
    item.raw_date = temp_date.toLocaleDateString();

    templateData.items.push(item);
  }

  var templateMarkup = $("#tumblr-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#main").append(template);
}

$(function(){
  var $container = $('#main');
  $container.imagesLoaded(function() {
    $container.isotope({
      itemSelector : '.thumbnail',
      getSortData : {
        date: function( $elem ) {
          return new Date($elem.find('.date').attr('data-date'));
        }
      },
      sortBy: 'date',
      sortAscending : false
    });

    var $optionSets = $('#filters'),
      $optionLinks = $optionSets.find('a');

    $optionLinks.click(function(){
      var $this = $(this);
      if ( $this.parent().hasClass('active') ) {
        return false;
      }
      var $optionSet = $this.parents('#filters');
      $optionSet.find('.active').removeClass('active');
      $this.parent().addClass('active');

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