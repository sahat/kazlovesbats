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
      uploadDate: entry.media$group.yt$uploaded.$t,
      likeCount: entry.yt$rating.numLikes,
      dislikeCount: entry.yt$rating.numDislikes
    };

    var minutes = Math.floor(parseInt(item.timeDuration) / 60);
    var seconds = parseInt(item.timeDuration) - minutes * 60;
    item.timeDuration = minutes + ':' + seconds;

    var date =  new Date(item.uploadDate);
    item.uploadDate = date.toLocaleDateString();

    templateData.items.push(item);
  }

  var templateMarkup = $("#youtube-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#container").append(template);
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
      likes: entry.likes.count,
      filter: entry.filter || 'None',
      created_time: new Date(1000 * entry.created_time).toLocaleDateString(),
      caption: entry.caption.text,
      commentsCount: entry.comments.count
    };

    templateData.items.push(item);
  }

  var templateMarkup = $("#instagram-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#container").append(template);

  $('.comments').click(function() {
    $.ajax({
      type : "get",
      dataType : "jsonp",
      url : 'https://api.instagram.com/v1/media/' + $(this).attr('id') + '/comments?access_token=6321489.f59def8.5ceb23cbbb664eef927df559469b663c&callback=getComments',
      success: function getComments(data) {

        var comments_obj = {
          comments: []
        };

        var entries = data.data || [];
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var item = {
            id: entry.id,
            username: entry.from.username,
            profile_picture: entry.from.profile_picture,
            user_id: entry.from.id,
            text: entry.text,
            created_time: new Date(1000 * entry.created_time).toDateString()
          };
          comments_obj.comments.push(item);
        }

        console.log(comments_obj);
        var modalMarkup = $("#modal-template" ).html();
        var template = _.template(modalMarkup, comments_obj);
        $('#commentsModal').html(template);
        $('#commentsModal').modal();
      }
    });
  });
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
      date: post.date,
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

    var date = new Date(item.date);
    item.date = date.toLocaleDateString();

    templateData.items.push(item);
  }

  var templateMarkup = $("#tumblr-template" ).html();
  var template = _.template(templateMarkup, templateData);
  $("#container").append(template);
}

function showBloggerPosts(data) {
  console.log(data);
}

$(function(){
  var $container = $('#container');
  $container.imagesLoaded(function() {
    $container.isotope({
      itemSelector : '.thumbnail',
      getSortData : {
        date: function( $elem ) {
          return new Date($elem.find('.date').text());
        }
      },
      sortBy: 'date',
      sortAscending : false
    });


    var $optionSets = $('#options'),
      $optionLinks = $optionSets.find('a');

    $optionLinks.click(function(){
      var $this = $(this);
      // don't proceed if already selected
      if ( $this.parent().hasClass('active') ) {
        return false;
      }
      var $optionSet = $this.parents('#options');
      $optionSet.find('.active').removeClass('active');
      $this.parent().addClass('active');

      // make option object dynamically, i.e. { filter: '.my-filter-class' }
      var options = {},
        key = $optionSet.attr('data-option-key'),
        value = $this.attr('data-option-value');
      // parse 'false' as false boolean
      value = value === 'false' ? false : value;
      options[ key ] = value;
      if ( key === 'layoutMode' && typeof changeLayoutMode === 'function' ) {
        // changes in layout modes need extra logic
        changeLayoutMode( $this, options )
      } else {
        // otherwise, apply new options
        $container.isotope( options );
      }

      return false;
    });
  });
});