(function(win, doc) {

    win.onload = init;

    var senators = [];
    
    // elements
    var membersList, democratsList, republicansList;
    var sourceId;

     
    function init() {

        membersList = doc.getElementById("members");
        democratsList = doc.getElementById("democrats");
        republicansList = doc.getElementById("republicans");
        
        membersList.ondragstart = dragStartHandler;
        membersList.ondragend = dragEndHandler;
        membersList.ondrag = dragHandler;

        // Add event handlers for the targets
        democratsList.ondragenter = dragEnterDemocratsHandler;
        democratsList.ondragover = dragEnterDemocratsHandler;
        democratsList.ondrop = dropDemocratsHandler;

        republicansList.ondragenter = dragEnterRepublicansHandler;
        republicansList.ondragover = dragEnterRepublicansHandler;
        republicansList.ondrop = dropRepublicansHandler;


        membersList.innerHTML = '';
        democratsList.innerHTML = '';
        republicansList.innerHTML = '';
        
        // load the senators xml file
        
         var storageData = window.localStorage.getItem("senators");
         if (storageData == null) {
             makeRequest("partyList.xml");
         }
         else {
             senators = JSON.parse(storageData);
             refreshDOM("From LocalStorage");
         }
         
    }


    function dragStartHandler(e) {
        e.dataTransfer.setData("Text", e.target.innerHTML);
        sourceId = e.target.innerHTML;     // explicitly for some browsers
        e.target.classList.add("dragged");
    }

    function dragEndHandler(e) {
        msg.innerHTML = "Drag ended";
        var elems = doc.querySelectorAll(".dragged");
        for(var i = 0; i < elems.length; i++) {
            elems[i].classList.remove("dragged");
        }
        democratsList.classList.remove("highlightedDemocrats");
        republicansList.classList.remove("highlightedRepublicans");
    }

    function dragHandler(e) {
        msg.innerHTML = "Dragging " + e.target.innerHTML;
    }

    function dragEnterDemocratsHandler(e) {
        var id = e.dataTransfer.getData("text") || sourceId;
        var isAllowed = false;
       
        for (var i = 0; i < senators.length; i++) {
            if ((senators[i].name == id) && 
                (senators[i].party == "Democrat") &&
                (!senators[i].voted)) {
                    isAllowed = true;
                break;
            }
        }
      
        if (isAllowed) {
             democratsList.className = "highlightedDemocrats";
       
            e.preventDefault();
        }
    }


    function dropDemocratsHandler(e) {
        var person = e.dataTransfer.getData("text") || sourceId;

        var newChild = doc.createElement("li");
        newChild.innerHTML = person;
        democratsList.appendChild(newChild);

        for (var i = 0; i < senators.length; i++) {
            if (senators[i].name == person) {
                senators[i].voted = true;
                updateStorageData();
                break;
            }
        }
      
      
        e.preventDefault();
    }


    function dragEnterRepublicansHandler(e) {
        var id = e.dataTransfer.getData("text") || sourceId;
        var isAllowed = false;
       
        for (var i = 0; i < senators.length; i++) {
            if ((senators[i].name == id) && 
                (senators[i].party == "Republican") &&
                (!senators[i].voted)) {
                    isAllowed = true;
                break;
            }
        }
      
        if (isAllowed) {
             republicansList.className = "highlightedRepublicans";
       
            e.preventDefault();
        }
    }


    function dropRepublicansHandler(e) {
        var person = e.dataTransfer.getData("text") || sourceId;

        var newChild = doc.createElement("li");
        newChild.innerHTML = person;
        republicansList.appendChild(newChild);

        for (var i = 0; i < senators.length; i++) {
            if (senators[i].name == person) {
                senators[i].voted = true;
                updateStorageData();
                break;
            }
        }
      
      
        e.preventDefault();
    }


    // XMLHttpRequest - asynchronous loading of XML data
    var xhr;

    function makeRequest(url) {
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (xhr) {
            xhr.onreadystatechange = loadXMLData;
            xhr.open("GET", url, true);
            xhr.send(null);
        }
        else {
            doc.getElementById("msg").innerHTML = 
                "Sorry, couldn't create an XMLHttpRequest";
        }
    }

    // callback function when data is loaded
    function loadXMLData() {

        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                // get all the senator elements
                var allSenators = xhr.responseXML.getElementsByTagName("senator");
                for (var i = 0; i < allSenators.length; i++) {
                    var name = 
                        allSenators[i].getElementsByTagName("name")[0].textContent;
                    var party = 
                        allSenators[i].getElementsByTagName("party")[0].textContent;
                    
                    // create a new JSON object for each song
                    var newSenator = {
                        "name" : name,
                        "party" : party,
                        "voted" : false
                    };
                    // add the object to the array
                    senators.push(newSenator);
                   }
                   updateStorageData();
                    refreshDOM("From AJAX");
                
             } else {
                doc.getElementById("msg").innerHTML = 
                        "There was a problem with the request " + xhr.status;
            }
        }
    }


    function refreshDOM(mode) {

        for (var i = 0; i < senators.length; i++) {
            var newChild = doc.createElement("li");
            newChild.setAttribute("draggable", "true");
            newChild.innerHTML = senators[i].name;
            membersList.appendChild(newChild);
            
            if (senators[i].voted) {
                newChild = doc.createElement("li");
                newChild.innerHTML = senators[i].name;
                if (senators[i].party == "Democrat")
                    democratsList.appendChild(newChild);
                else
                    republicansList.appendChild(newChild);
                
            }
        }
        doc.getElementById("msg").innerHTML = 
            mode + " Loaded " + senators.length + " senators";
    }

    function updateStorageData() {
        window.localStorage.setItem("senators", JSON.stringify(senators));
    }

})(window, document);

   