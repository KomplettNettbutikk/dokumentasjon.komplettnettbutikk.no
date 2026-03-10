
(async() => {
  while((typeof initLunr !== 'function') || (typeof pagesIndex !== 'object')) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  runSearchFromQuery();
})();




function runSearchFromQuery() {
  var query = decodeURIComponent((getQueryVariable("q") || "").replace(/\+/g, "%20"));
  var results = search(query);
  if (results.length === 0) {
    $("#search-query-result-page").html('<h2>Ingen resultater</h2>');
    return;
  }

  $.each(results, function (index, value) {
    $("#search-query-result-page tbody").append(
      "<tr><td class='result-item'><a target='_top' href='"
      + value.uri
      + "'><span class='title'>"
      + value.title
      // + " <small>"
      // + value.uri.split(baseurl)[1]
      // + "</small>"
      + "</span><span class='desc'>"
      + value.description
      + "</span></a></td></tr>"
    );
  });
}



function getQueryVariable(variable) {
  var query = window.location.search.substring(1),
    vars = query.split("&");

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");

    if (pair[0] === variable) {
      return decodeURIComponent(pair[1].replace(/\+/g, '%20')).trim();
    }
  }
}
