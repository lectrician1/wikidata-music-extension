import $ from 'jquery';
window.jQuery = $;
window.$ = $;

require('jquery-sendkeys');
var Discogs = require('disconnect').Client;

const WBK = require('wikibase-sdk');
const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});

const property = 'P1954';

function getEntityLabel(id) {
  var label;
  var apiurl = wdk.getEntities({
    ids: [id],
    language: 'en',
  });
  fetch(apiurl)
    .then((response) => response.json)
    .then(wdk.parse.wb.entities)
    .then((d) => {
      var entity = d[0];
      label = entity.labels['en'].value;
    });

  return label;
}

function appendDiscogsValue(wikidataProp, discogsProp, value) {
  $(`#${wikidataProp}`)
    .find('.wikibase-statementgroupview-property-label')
    .append(`<br>Discogs ${discogsProp}:<br>${value}`);
}

jQuery(() => {
  if ($('#' + property).length) {
    // Get qid
    var entityurl = new URL(window.location.href);
    var qid = entityurl.pathname.substring(6);

    var apiurl = wdk.getEntities({
      ids: [qid],
    });
    fetch(apiurl)
      .then((response) => response.json())
      // Turns the response in an array of simplified entities
      .then(wdk.parse.wb.entities)
      .then((d) => {
        var entity = d[qid];
        var masterid = parseInt(entity.claims[property][0]);

        var db = new Discogs().database();
        db.getMaster(masterid, function (err, data) {
          $(`#${property}`)
            .find('.wikibase-snakview-body')
            .eq(0)
            .append(
              $(
                '<a id="discogs-extra">Show extra Discogs data</a><div id="extra-expanded" style="display: none"></div>'
              )
            );

          for (const discogsProp in data) {
            var wikidataProp;
            var notfound = false;

            // Get discogs value in future and parse
            switch (discogsProp) {
              case 'genres':
                wikidataProp = 'P136';
                break;
              case 'styles':
                wikidataProp = 'P136';
                break;
              case 'artists':
                wikidataProp = 'P175';
                break;
              case 'tracklist':
                wikidataProp = 'P658';
                break;
              case 'title':
                wikidataProp = 'P1476';
                break;
              case 'year':
                wikidataProp = 'P577';
                break;
              default:
                notfound = true;
            }

            var discogsValue = JSON.stringify(data[discogsProp], null, 4);

            if (!notfound) {
              // if discogs has data wikidata has, append data to wikidata element
              if (wikidataProp in entity.claims) {
                appendDiscogsValue(wikidataProp, discogsProp, discogsValue);
              }
              // if discogs has data wikidata does not, add a statement
              else {
                var formattedDiscogsValue = discogsValue.replace(
                  /\n( *)/g,
                  function (match, p1) {
                    return '<br>' + '&nbsp;'.repeat(p1.length);
                  }
                );
                $('.wikibase-listview')
                  .eq(0)
                  .append(
                    `Discogs ${discogsProp}<pre>${formattedDiscogsValue}</pre><br><a class="discogs-add">Add</a>`
                  );

                $(document).on('click', '.discogs-add', function () {
                  $(`a[title='Add a new statement']`)[0].click()
                  setTimeout(function () {
                    $('.wikibase-snakview-property').children('.ui-suggester-input').sendkeys(wikidataProp)

                    setTimeout(function () {
                      $('.ui-ooMenu:not(.wikibase-entitysearch-list) > .ui-ooMenu-item').eq(0).trigger('mouseenter.ooMenu')
                      $('.ui-ooMenu:not(.wikibase-entitysearch-list) > .ui-ooMenu-item').eq(0).trigger({type:'mousedown.ooMenu', which: 1})
                    }, 1000)
                  }, 1000)
                  

                });
              }
            } else {
              $('#extra-expanded').append(
                `Discogs ${discogsProp}<br><pre>${discogsValue}</pre>`
              );
            }
          }

          $('#discogs-extra').on('click', function () {
            $('#extra-expanded').slideToggle('fast');
          });
        });
      });
  }

})