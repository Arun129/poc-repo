
$( document ).ready(function() {
 
    $(".navigational").click(function(event) {
 
        event.preventDefault();
 
    });
    
    
 /*   var highestBox = 0;
    $('.remaining_risk .equal').each(function(){  
            if($(this).height() > highestBox){  
            highestBox = $(this).height();  
    }
    });    
    $('.remaining_risk .equal').height(highestBox);
    alert(highestBox);
 */   
    
 
});

/*
function equalHeights() 
{
    var findClass = document.getElementsByClassName('equal');
    var tallest = 0; 
	for(i = 0; i < findClass.length; i++)
	{
		var ele = findClass[i];
		var eleHeight = ele.offsetHeight;
		tallest = (eleHeight>tallest ? eleHeight : tallest); 
	}
	for(i = 0; i < findClass.length; i++)
	{
		findClass[i].style.height = tallest + "px";
	}
}
equalHeights()

window.onresize = function(event) {
  equalHeights()
};

window.addEventListener("orientationchange", function() {
    equalHeights() 
});

*/

