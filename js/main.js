$(function(){
  var $container = $('#container');

  $container.isotope({
    itemSelector : '.thumbnail'
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