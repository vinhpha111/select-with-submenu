$(document).ready(function(){
	jQuery.fn.instance_select_group = function(config = {}) {
	  return this.each(function(index){
	  	let value = null;
	    let jsonData = xmlToJson(this);
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

	    $('.select-submenu-'+currentTime).on('click', '.button', function(){
	    	if(!$('.select-submenu-'+currentTime).find('.content-option').hasClass('show')) {
		    	currentPosition = oldPosition.slice();
		    	let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value);
		    	$(this).parent().find('.content-option').html(contentHtml);
		    	$('.select-submenu-'+currentTime).find('.content-option').addClass('show');
		    }
	    });
	    $('.select-submenu-'+currentTime).on('click', '.row-select', function(){
	    	if($(this).hasClass('has_children')) {
	    		currentPosition.push($(this).data("position"));

	    		$('.select-submenu-'+currentTime).find('.content-option').removeClass('show');
	    		let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value);
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
	    	let contentHtml = generateHtmlContentOption(jsonData, currentPosition, value);
	    	$(this).parent().parent().html(contentHtml);
	    	setTimeout(function(){
	    		$('.select-submenu-'+currentTime).find('.content-option').addClass('show');
	    	});
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

function generateHtmlContentOption(jsonData, position, value = null) {
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
	let html = "<ul>";
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