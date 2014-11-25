$(function() {

	/** Stack to keep track of Customers displayed */
	var customersWaiting = [];

	/* this should be more of a dynamic color generator function 
	 * that could pick nice colors, avoiding clashes etc, 
	 * but for the demo its just a static list of pretty colors */
	var zipCodeColorMap = {89120:'#A05786',89121:'#231098',89122:'#A05786',89123:'#A05786',89124:'#719238',89125:'#9B7782',89126:'#3A54BF',89127:'#C224F9',89128:'#DA9222',89129:'#8942C7',89130:'#B622DB',89131:'#416951',89132:'#923C63',89133:'#53EF60'};
	
	/** 
	 * ServerEventListener: Main Stream
   * When the server Ticks the CustomerDocument is streamed as a JSON message to this EventListener
   * A couple functions on the Customer help draw the interface, decide which column they belong in, if it should move, and what color it should be
 	 */
	var ev = new EventSource('/stream');
	ev.addEventListener("message", function(broadcast) 
	{
		//- I am the document.
		var customer = JSON.parse(broadcast.data);

		//- Set my timestamp to the ObjectId Timestamp
	  customer.timestamp = new Date(parseInt(customer._id.substring(0,8), 16)*1000); 

	  /* How long have I been in the stack? */
		customer.getMinutesInQueue = function () 
		{
		  var timeInQueue = Math.abs(new Date() - this.timestamp);
		  return Math.floor( (timeInQueue/1000)/60 ); //- Minutes
		},

		/* Am I in the right line? */
		customer.findQueue = function() 
		{
			var timeInQueueMinutes = this.getMinutesInQueue();
		  if(timeInQueueMinutes>=10) {
				return $('#redList');
		  } else if(timeInQueueMinutes<2) {
				return $('#greenList');
		  } else if(timeInQueueMinutes>=5) {
				return $('#orangeList');
		  } else {
				return $('#yellowList');
		  }
		};

		/* Show my details in the sidepanel */
		customer.showDetails = function(ev) 
		{
			$('.customer').removeClass('selected animated rubberband');
			$( $(ev.target).closest('.customer')).addClass('selected animated rubberband');
			var customer = ev.data.customerObj;
			var $details = $('#tileDetails');
			var timeInQueueMinutes = customer.getMinutesInQueue();
			$('#removeButton').removeClass('hidden');
			//- Didnt bring in eg handlebars to draw this 'template', but I would as a next step if this got more elaborate
			//- Im not a fan of this kind of raw html output in general, its ugly and hard to maintain
			var tpl = '<strong>'+customer._id+'<br/>'+ customer.timestamp.toLocaleString('en-US')+'</strong>'
							+ '<br/><span class="fa fa-clock-o"></span> '+timeInQueueMinutes+' minutes!<br/>'
							+ '<span class="fa fa-user"></span> '+customer.name.toString()+'<br/>'
							+ '<span class="fa fa-map-marker"></span> '+customer.region.toString()+'<br/>';
			return $details.html(tpl);
		};
										 
		/* Put me in line  */
		if( customersWaiting.indexOf(customer._id)  == -1)
		{
			customersWaiting.push(customer._id);	

			var $div = $(document.createElement('li'));
			$div.addClass('customer');
			$div.attr('id', customer._id);
			var $span = $(document.createElement('span')).addClass('fa-stack fa-sm');
			$span.append($(document.createElement('span')).addClass('fa fa-square fa-stack-2x'));
			$span.append($(document.createElement('span')).addClass('fa fa-car fa-stack-1x fa-inverse'));
			$div.append($span);

			/* color the pickups in the same area the same color for easy identification */
			$div.css('color', zipCodeColorMap[customer.region]);
			
			/* put me in the right bucket */
			var $results = customer.findQueue();
			$results.append($div);
			$div.addClass('animated bounceInUp');
			setTimeout(function() { //- Remove the animation so we can re-add it when we need it
				$div.removeClass('animated bounceInUp');
			}, 750);

			/* Customer Tile Events */
			$div.on('click', {customerObj: customer}, customer.showDetails);
			
		}
		/* Am I in the right line? Am I in the right line? Am I in the right line? */
		else { 
			var $el = $('#'+customer._id);
			var currentBucket = $el.parent().attr('id'); //- the timeslot I am currently in
			var supposedBucket = customer.findQueue();  //- the timeslot I should be in
			if(currentBucket != supposedBucket.attr('id')) { //- Jim is getting upset!!!!!!!!
				$el.remove().appendTo(supposedBucket);
				$el.addClass('animated lightSpeedIn');
				$el.on('click', {customerObj: customer}, customer.showDetails);
			}
		}
	});

	/**
	 * ServerEventListener: RemoveCustomer
	 * The server sends a final updated Customer List with every Tick
	 * Because if a Customer is deleted via the API they need to be removed from the Client
	 */
	ev.addEventListener('validateCollection', function(broadcast) 
	{
		//- the list of all the customers in the backend
		var customers = JSON.parse(broadcast.data);

		$('.customer').each(function(k, el) {
			//- if they're in the front but not in the back, remove them
			if(customers.indexOf($(el).attr('id')) == -1) 
			{
				$(el).addClass('animated bounceOut');

				//- wait for the animation to finish
				setTimeout(function() { $(el).remove();	}, 750);
			}
		});
	});

	/**
	 * The stream handles the drawing of the board so these just call the API and the interface refreshes on the next tick
   */

	/** 
	 * EventListener: AddCustomer 
	 */
	$('#addButton').on('click', function(ev) 
	{
		$.post('/customers', { name: $('#customerSelect').val(), region: $('#regionSelect').val() })
			.success(function(res) {
				console.log(res.message);
			});
	});

	/** 
	 * EventListener: RemoveCustomer 
	 */
	$('#removeButton').on('click', function(ev) {
		var customerId = $('.selected').attr('id');
		$.ajax({ url:'/customers/'+customerId, type: 'DELETE' })
			.success(function(res) {
				console.log(res.message);
			});
	});

});

