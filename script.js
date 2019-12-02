$(document).ready(function(){
	jQuery.fn.instance_select_group = function(config = {}) {
	  return this.each(function(index){
	  	let value = null;
	    let jsonData = xmlToJson(this);
	    console.log(jsonData);
	    let currentPosition = [];
	    let oldPosition = [];
	    let currentTime = (new Date()).getTime() + index;
	    let html = "<div class='select-submenu-"+currentTime+"'>" 
	    	+"<div class='button'>"
	    	+ generateButton(config, config.defaultText ? config.defaultText : 'select')
	    	+"</div>"
	    	+ "<div class='content-option'></div>"
	    	+ "</div>"
	    $(this).after(html);

	    if(config.search) $('.select-submenu-'+currentTime).find('.content-option').addClass('has_search');

	    $('.select-submenu-'+currentTime).on('click', '.button', function(){
	    	if(!$('.select-submenu-'+currentTime).find('.content-option').hasClass('show')) {
		    	currentPosition = oldPosition.slice();
		    	let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value, config);
		    	$(this).parent().find('.content-option').html(contentHtml);
		    	$('.select-submenu-'+currentTime).find('.content-option').addClass('show');
		    }
	    });
	    $('.select-submenu-'+currentTime).on('click', '.row-select', function(){
	    	if($(this).hasClass('has_children')) {
	    		currentPosition.push($(this).data("position"));

	    		$('.select-submenu-'+currentTime).find('.content-option').removeClass('show');
	    		let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value, config);
	    		$(this).parent().parent().html(contentHtml);
	    		setTimeout(function(){
	    			$('.select-submenu-'+currentTime).find('.content-option').addClass('show');
	    		});
	    	} else {
	    		oldPosition = currentPosition.slice();
	    		value = $(this).attr('value');
	    		$('.select-submenu-'+currentTime).find('.content-option').removeClass('show');
	    		$('.select-submenu-'+currentTime).find('.button').html(generateButton(config, $(this).attr('text-label') ? $(this).attr('text-label') : $(this).text()));
	    		$('.select-submenu-'+currentTime).find('.button')
	    		.append("<input type='hidden' name='"+(jsonData.name ? jsonData.name : "")+"' value='"+value+"'>")
	    	}
	    });
	    $('.select-submenu-'+currentTime).on('click', '.back', function(){
	    	currentPosition.splice(currentPosition.length - 1, 1);
	    	$('.select-submenu-'+currentTime).find('.content-option').removeClass('show');
	    	let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value, config);
	    	$(this).parent().parent().html(contentHtml);
	    	setTimeout(function(){
	    		$('.select-submenu-'+currentTime).find('.content-option').addClass('show');
	    	});
	    });
	    $('.select-submenu-'+currentTime).on('keyup', '.search-input', function(){
	    	let textSearch = $('.select-submenu-'+currentTime+' .search-input').eq(0).val();
	    	console.log('searching', textSearch);
	    	let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value, config);
	    	if(textSearch.length > 0) {
	    		let htmlSearch = generateListSearchToHtml(searchInJson(jsonData, textSearch));
		    	$('.select-submenu-'+currentTime).find('.list-option').remove();
			    $('.select-submenu-'+currentTime).find('.list-search-container').html(htmlSearch);
			} else {
				let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value, config);
				$('.select-submenu-'+currentTime).find('.content-option').html(contentHtml);
			}
	    });
	    let currentHover = false;
	    $('.select-submenu-'+currentTime).hover(function(){
	    	currentHover = true;
	    }, function(){
	    	currentHover = false;
	    });
	    $('*').click(function(){
	    	if(!currentHover)
	    		$('.select-submenu-'+currentTime).find('.content-option').removeClass('show');
	    });
	    $(this).remove();
	  });
	};
});

function generateButton(config, textLable) {
	let html = (config.htmlButton 
	    	? config.htmlButton.replace('$text', textLable)
	    	: "<button style='color: black;' class='btn btn-info'> "+ textLable +" <span class='glyphicon'>&#xe114;</span></button>" );
	return html;
}

function generateHtmlContentOption(jsonData, position, value = null, config = {}, textSearch = '') {
	let data = null;
	data = jsonData;
	let parentLabel = null;
	if (position.length > 0) {
		for(let i in position) {
			parentLabel = data.children[position[i]].label;
			data = data.children[position[i]];
		}
		data = data.children;
	} else {
		data = jsonData.children;
	}
	let html = '';
	if (config.search) {
		html += "<div class='search-container'>";
		html += "<ul class='search-group'><li><input style='min-width: 120px;' placeholder='search' type='text' class='search-input form-control' id='pwd'></li></ul>";
		html += "<div class='list-search-container'></div>"
		html += "</div>";
	}
	console.log(textSearch);
	html += "<ul class='list-option'>";
	if (parentLabel) {
		html += "<li class='parent-label'><button class='btn btn-link btn-xs back'><span class='glyphicon'>&#xe079;</span></button>"+parentLabel+"</li>";
	}
	for(let i in data) {
		if(data[i].children) {
			html += "<li class='row-select has_children' data-position='"+i+"'>"+data[i].label+"<span class='glyphicon submenu-icon'>&#xe258;</span></li>";
		} else {
			html += "<li class='row-select "+((value !== null && value === data[i].value) ? 'active' : '')+"' value='"+data[i].value+"' text-label='"+ (data[i]['text-label'] ? data[i]['text-label'] : '') +"'>"+data[i].content+"</li>";
		}
	}
	html += "</ul>";
	return html;
}

function searchInJson(jsonData, stringSearch = '', recall = false) {
	let data = jsonData.children;
	let dataSearch = [];
	for(let i in data) {
		if(data[i].children) {
			dataSearch.push({
				name: data[i].label,
				children: searchInJson(data[i], stringSearch)
			});
		} else {
			if(data[i].content.search(stringSearch) !== -1) {
				dataSearch.push(data[i]);
			}
		}
	}
	return dataSearch;
}

function generateListSearchToHtml(listSearch) {
	let html = "";
	html += "<ul class='list-search'>";
	for(let i in listSearch) {
		if(typeof listSearch[i].children !== 'undefined' && listSearch[i].children.length > 0) {
			html += "<li class='list-search-parent-label'>"+listSearch[i].name+"</li>";
			html += generateListSearchToHtml(listSearch[i].children);
		} else if(typeof listSearch[i].content !== 'undefined' && listSearch[i].content !== null && listSearch[i].content.length > 0) {
			html += "<li class='search-item'>"+listSearch[i].content+"</li>";
		}
	}
	html += "</ul>";
	console.log(html);
	return html;
}

function xmlToJson(element) {
	let json = {};
	let localName = $(element).get(0).localName;
	json.elementName = localName;
	$.each(element.attributes,function(i,a){
           json[a.name] = a.value
    });
    let children = $(element).children();
    if(children.length > 0) {
    	let arrChild = [];
	    for(let i = 0; i < children.length; i++) {
	    	arrChild.push(xmlToJson(children[i]));
	    }
	    json.children = arrChild;
	} else {
		json.content = $(element).text();
	}
	return json;
}