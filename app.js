
//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc){

        if(totalInc > 0){
            this.percentage = Math.round((this.value/totalInc) * 100); 
        }
        else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItem[type].forEach(function(curr){
            sum += curr.value;
        });
        
        data.totals[type] = sum;

    };

    var data = {
        allItem:{
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem : function(type, des, val){
            var newItem, ID;
            //Create new ID

            if(data.allItem[type].length > 0)
            {
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            
            //Create new item based on inc or exp
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //Add new item to proper inc or exp array from the data object
            data.allItem[type].push(newItem);

            //Return the new item to be used in other modules
            return newItem;

        },

        deleteItem : function(type, id){
            var ids, index;

            ids = data.allItem[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItem[type].splice(index,1);
            }
        },

        calculateBudget : function(){
            //Calculate the total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of the income spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
            
        },
        calculatePercentages : function(){
            data.allItem.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });

        },

        getPercentages : function(){
            var allPerc = data.allItem.exp.map(function(curr){
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget : function(){
            return {
                incTotal : data.totals.inc,
                expTotal: data.totals.exp,
                budget : data.budget,
                percentage : data.percentage   
            };

        },

        testing : function(){
            console.log(data);
        }
    };
 

})();
//***************************************************************************************************** */
//UI CONTROLLER

var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDes: '.add__description',
        inputValue: '.add__value',
        inputBut: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }; 

    var formatNumber = function(num, type){
        // + or - before the number
        // exactly two decimal points
        // comma separating the thousands
        var num, numSplit, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return  (type === 'exp' ? '-' : '+') + ' '+  int + '.' + dec;

    };

    var nodeListForEach = function(list, callback){
         
        //node list doesnt have forEach method like arrays so here we construct one for it.
        for( var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };


    return{
        getInput : function(){
            return{
                    type: document.querySelector(DOMstrings.inputType).value,
                    description: document.querySelector(DOMstrings.inputDes).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem : function(obj, type){
            var html, newHTML, element;

            //Create html string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

            
        },

        clearFields : function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDes + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(curr, index, array){

                curr.value = "";
            });

            fieldsArr[0].focus();

        },

        deleteListItem : function(secID){
            var el;
            el = document.getElementById(secID);
            el.parentNode.removeChild(el);

        },

        displayBudget : function(obj){

            var type;
            obj.budget > 0 ? type === 'inc' : type === 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.incTotal, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.expTotal, 'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentage : function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);
            nodeListForEach(fields, function(current, index){
                current.textContent = percentages[index] + '%';
            });

        },

        displayDate : function(){
            var now, month, year;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMstrings.dateLabel).textContent = allMonths[month] + ' ' + year;

        },

        changeType : function(){
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDes + ',' + DOMstrings.inputValue);
            
            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBut).classList.toggle('red');

        },


        getDOMstrings : function(){
            return DOMstrings;
        }
    };

})();

//****************************************************************************************************** *
//APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var setUpEventListeners = function(){
        document.querySelector(DOM.inputBut).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){
           ctrlAddItem();
        }

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    });
};
    
    var DOM = UICtrl.getDOMstrings();


    var updateBudget = function(){
        //Calculate the budget
        budgetCtrl.calculateBudget();

        //Return budget
        var budget = budgetCtrl.getBudget();

        //Display budget on UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentage = function(){
        //1. calculate the percentage
        budgetCtrl.calculatePercentages();

        //2. read percentages from budget controller
        var percent = budgetCtrl.getPercentages();

        //3. update the UI with new percentages
        UICtrl.displayPercentage(percent);
    }
    
    var ctrlAddItem = function(){
        //1. get field input data
        var input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        
        //2. add item to the budget controller
        var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        //3. add item to UI
        UICtrl.addListItem(newItem, input.type);

        //4. clear the input fields
        UICtrl.clearFields();

        //5. Calculate budget
        updateBudget();

        //6.
        updatePercentage();

        }
        
        
    };

    var ctrlDeleteItem = function(event){

        var itemID, splitID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentage();

        }

    }

    return {
        init: function(){
            console.log("Application has started");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                incTotal : 0,
                expTotal: 0,
                budget : 0,
                percentage : -1
            });
            setUpEventListeners();
        }
    };
    
})(budgetController, UIController);
//******************************************************************************************************* */

controller.init();