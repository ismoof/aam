/*
    Plugin: magicAAM
    Last Build: 2018/01/10
    Features:
        - Remove login background
        - Search box for traits and segments
        - Add open in new tab option
        - Auto refresh when inactive
        - Expand the folder tree box for segments and traits
        - Expand Destination Mapping box by default
        - Show Destination Mapping ID
        - Add export to CSV functionality for Destination Mapping
*/
$(document).ready(function() {

    var version = '1.1.2';

    $('#background, #attribution').css("background-image", "none");

    // Search box for traits and segments
    var magicCss = '<style>#magicSearchBox{display:inline-block; padding: 10px; position: absolute; bottom: 20px; left: 20px; z-index:100; border-radius: .1875rem;  border: .0625rem solid #e9e9e9;  background-color: #f0f0f0;}#magicQuickAccess{font-size:0.5em;}.magicMenuItem{display:inline-block;margin-left: 2px;padding:3px 4px;color:#fff;background:#666;text-decoration:none;}.magicMenuItem:hover{background:#333;text-decoration:none;}#magicSearchBoxForm{clear:both;margin-top: 5px;}</style>';
    var magicUrlBase = 'https://bank.demdex.com/portal/';
    var magicUrlEndView = '.ddx#view/';
    var magicUrlEndEdit = '.ddx#edit/';
    var magicUrlSegment = 'Segments/SegmentBuilder';
    var magicUrlTrait = 'Traits/Traits';
    var magicInputSegment = '<input type="text" id="magicInputSegment" placeholder="Segment ID" /><br>';
    var magicInputTrait = '<input type="text" id="magicInputTrait" placeholder="Trait ID" style="margin-top: 5px;" /><br>';
    var magicCheckTab = '<label style="font-size:0.5em;">Open in new Tab <input type="checkbox" id="magicCheckTab" /></label>';

    var magicMenu = '<div id="magicQuickAccess">Quick Access: <a href="https://bank.demdex.com/portal/Segments/SegmentBuilder.ddx#list" class="magicMenuItem">Segments</a><a href="https://bank.demdex.com/portal/Traits/Traits.ddx#show/list" class="magicMenuItem">Traits</a></div>';

    var magicSearchBox = magicCss+'<div id="magicSearchBox">'+magicMenu+'<div id="magicSearchBoxForm">' + magicInputSegment + magicInputTrait + magicCheckTab + '<p style="text-align:center;margin:5px 0 0 0;padding:0;"><input type="button" class="magicBtn" id="magicBtnView" value="VIEW"/> <input type="button" class="magicBtn" id="magicBtnEdit" value="EDIT"/></p></div><span style="position:absolute;top:0px;right:3px;cursor:pointer;line-height:10px;font-size:10px;font-weight:bold" id="magicCollapse">x</span></div>';
    $('body').prepend(magicSearchBox);

    function magicRun(magicS, magicT, action) {
        if (action == 'VIEW') {
            magicUrlEnd = magicUrlEndView;
        } else {
            magicUrlEnd = magicUrlEndEdit;
        }
        if (magicS !== '') {
            magicObj = magicUrlSegment + magicUrlEnd + magicS;
        } else {
            magicObj = magicUrlTrait + magicUrlEnd + magicT;
        }
        magicUrl = magicUrlBase + magicObj;

        if($('#magicCheckTab').is(':checked')){
            var win = window.open(magicUrl, '_blank');
            win.focus();
        } else {
            window.location.href = magicUrl;
        }
    }
    $('#magicCollapse').click(function() {
        var iteration = $(this).data('iteration') || 1;
        switch (iteration) {
            case 1:
                $('#magicSearchBoxForm').hide();
                $('#magicCollapse').html('+');
                break;
            case 2:
                $('#magicSearchBoxForm').show();
                $('#magicCollapse').html('x');
                break;
        }
        iteration++;
        if (iteration > 2) iteration = 1;
        $(this).data('iteration', iteration);
    });
    $('#magicBtnView').click(function() {
        magicRun($('#magicInputSegment').val(), $('#magicInputTrait').val(), 'VIEW');
    });
    $('#magicBtnEdit').click(function() {
        magicRun($('#magicInputSegment').val(), $('#magicInputTrait').val(), 'EDIT');
    });


    // Auto refresh when inactive
    var activityTimeout = setTimeout(inActive, 600000);

    function resetActive() {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(inActive, 600000);
    }

    function inActive() {
        location.reload();
    }
    $(document).bind('mousemove keypress', function() {
        resetActive()
    });


    // Expand the folder tree box for segments and traits
    var usableHeight = ($( window ).height())-267;
    $('#SegmentList .segmentFolderTree, #TraitList .traits_folder_tree').css({
        'width': '100%',
        'height': usableHeight+'px',
        'overflow-x': 'auto',
        'overflow-y': 'none',
        'padding-bottom': '25px'
    });

    // Expand Destination Mapping box by default
    $('#seDestinations .coral-Collapsible-content').show();
    $('#seDestinations h3 i').removeClass('coral-Icon--chevronRight');
    $('#seDestinations h3 i').addClass('coral-Icon--chevronDown');

    // Show Destination Mapping ID
    $('#seDestinations h3').append('<button type="button" id="showDestMapId" class="coral-Button coral-Button--primary" style="font-size:11px;padding:2px;height:22px;">Destination Mapping Id</button>');
    $('#showDestMapId').on('click', function() {
        $('#seDestinations th:first-child').append('<br>Destination Mapping ID');
        $('#seDestinations table tbody tr td:last-child').each(function() {
            var destIdDestMapId = ($(this).find('a.edit').attr('rel'));
            var destMapId = destIdDestMapId.split(',');
            $(this).parent().children(':first-child').append(' <br><strong style="color:#326ec8"># ' + destMapId[1] + '</strong>');
            $('#showDestMapId').hide();
        });
    });

    // Add export to CSV functionality for Destination Mapping
    function exportTableToCSV($table, filename) {
        var $rows = $table.find('tr:has(td)'),
            tmpColDelim = String.fromCharCode(11),
            tmpRowDelim = String.fromCharCode(0),
            colDelim = '","',
            rowDelim = '"\r\n"',
            csv = '"' + $rows.map(function(i, row) {
                var $row = $(row),
                    $cols = $row.find('td');
                return $cols.map(function(j, col) {
                    var $col = $(col),
                        text = $col.text();
                    return text.replace(/"/g, '""')
                }).get().join(tmpColDelim)
            }).get().join(tmpRowDelim).split(tmpRowDelim).join(rowDelim).split(tmpColDelim).join(colDelim) + '"';
        if (!1 && window.navigator.msSaveBlob) {
            blob = new Blob([decodeURIComponent(csv)], {
                type: 'text/csv;charset=utf8'
            });
            window.navigator.msSaveBlob(blob, filename)
        } else if (window.Blob && window.URL) {
            blob = new Blob([csv], {
                type: 'text/csv;charset=utf-8'
            });
            var csvUrl = URL.createObjectURL(blob);
            $(this).attr({
                'download': filename,
                'href': csvUrl
            })
        } else {
            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            $(this).attr({
                'download': filename,
                'href': csvData,
                'target': '_blank'
            })
        }
    }
    $('#seDestinations h3').append(' <a href="#" id="destMapIdExport" class="coral-Button coral-Button--primary" style="font-size:11px;padding:2px;height:22px;">Export to Excel</a>');
    $("#destMapIdExport").on('click', function(event) {
        var args = [$('#seDestinations table'), 'export.csv'];
        exportTableToCSV.apply(this, args);
    });

    $('#segListW h4').append(' <a href="#" id="viewMapIdExport" class="coral-Button coral-Button--primary" style="font-size:11px;padding:2px;height:22px;">Export to Excel</a>');
    $("#viewMapIdExport").on('click', function(event) {
        var args = [$('#segListW table'), 'export.csv'];
        exportTableToCSV.apply(this, args);
    });


    // Add Segments links in the Destination page
    $('#destMappings').append(' <a href="#" id="destMappingsBtn" class="coral-Button coral-Button--primary" style="font-size:11px;padding:2px;height:22px;">Enable segments links</a>');
    $("#destMappingsBtn").on('click', function(event) {
        $('#segsMappedView tbody tr td:first-child').each(function() {
            var sid = $(this).html();
            var url = 'https://bank.demdex.com/portal/Segments/SegmentBuilder.ddx#edit/'+sid;
            $(this).html('<a href="'+url+'" target="_blank">'+sid+'</a>');
        });
    });




    console.log('Magic AAM loaded: '+version);
});
