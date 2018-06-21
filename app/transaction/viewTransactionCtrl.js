

jhora.controller('viewTransactionCtrl', function($rootScope, $scope, $timeout, $mdDateLocale,$routeParams,$window, TRANSACTION_TYPES, VIEW_LIMITS, TRANSACTION_TABLE, DELTRANSACTION_TABLE) {

    const {shell} = require('electron');
    $rootScope.template = {title: 'Transactions'};
    $scope.types = TRANSACTION_TYPES;
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.transaction = { amount: '', date: null, promiseDate: null, type: '', customerId: '', name: '', village:'', remarks: '' };
    $scope.customer = { name: '', mobile: '', village: '', father: '', guarantor: '', rate:'', date: null, pageNo: '', remarks: '' };
    $scope.transactions = [];
    $scope.hideNoDataFound = true;
    $scope.tran = {fromDate: null, toDate: null};
    $scope.maxDate = new Date();
    $scope.deleteDate = new Date();
    let deletedOn =  $mdDateLocale.parseDate($scope.deleteDate);
    $scope.deleteTransaction=(ev,transaction)=>{
      shell.beep()
      $rootScope.showDialog(ev,'transaction', transaction, 'transaction/previewTransaction.html','Are you sure to delete...?')
      .then(function(answer) {
        if(answer == 'submit') {
          $scope.confirmTransaction(transaction);
        }
      });
  }

  $scope.confirmTransaction = (transaction)=>{
    let  {amount, rate, date, promiseDate, type, customerId, name, village, remarks } = transaction;
    let keys = ['amount', 'rate', 'date', 'promiseDate', 'type', 'customerId', 'name', 'village', 'remarks','deletedOn' ];
    let values =[amount,rate, date, promiseDate, type, customerId, name, village, remarks,deletedOn];
    let nDate = $mdDateLocale.parseDate(values[2]);
    let nPromiseDate = $mdDateLocale.parseDate(values[3]);
    values[2] = nDate;
    values[3] = nPromiseDate;
    q.insert(DELTRANSACTION_TABLE, keys, values)
    .then((data)=>{
      return q.updateStatus(TRANSACTION_TABLE, 'active', '0', 'id', transaction.id)
    })
    .then((data)=>{
      $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE,'active','1');
      $rootScope.showToast(`${transaction.name}'s Transaction Deleted`);
    })
    .catch((err)=>{
      console.error('anp an err occured while deleting',err);
    });
  }

  $scope.getDataByTable = (tableName, modelName,column,value)=>{
    q.selectAllById(tableName,column,value)
    .then((rows)=>{
      if(rows)
      for(let row of rows){
        row.date = row.date ? new Date(row.date) : null;
        if(tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE)
        row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : null;
      }
      $timeout(()=>{
        $scope[modelName] = rows;
        $scope.hideNoDataFound = true;
        if((tableName == TRANSACTION_TABLE || tableName == DELTRANSACTION_TABLE) && rows.length == 0)
        $scope.hideNoDataFound = false;
      }, 0);
    })
    .catch((err)=>{
      console.error('anp got error while fetching data',err);
    });
  };

  $scope.getNewData= (queryFor)=>{
    $scope.startFilter = false;
    $scope.tran.toDate = null;
    $scope.tran.fromDate = null;
    if(queryFor == $scope.limits[1]) {
      $scope.getDataByTable(DELTRANSACTION_TABLE, TRANSACTION_TABLE,`'1'`,1);
    }else{
      $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE,'active','1');
    }
  }

  $scope.getTransaction= (queryFor)=>{
    if(queryFor == $scope.limits[1]) {
      $scope.getFilter(DELTRANSACTION_TABLE, 'date',1,1);
    }else{
      $scope.getFilter(TRANSACTION_TABLE, 'date','active',1);
    }
  }

  $scope.getFilter=(tableName,column1,column2,value)=>{
    if($scope.tran.toDate) {
      $scope.startFilter = true;
      let fromDate = $mdDateLocale.parseDate($scope.tran.fromDate);
      let toDate = $mdDateLocale.parseDate($scope.tran.toDate);
      q.selectDataByDates(tableName,column1,fromDate,toDate,column2,value)
        .then((rows)=>{
          $timeout(()=>{
            if(rows)
            for(let row of rows){
              row.date = row.date ? new Date(row.date) : undefined;
              row.promiseDate = row.promiseDate ? new Date(row.promiseDate) : undefined;
            }
          $scope.transactions= rows;
          $scope.hideNoDataFound = true;
          if (rows.length == 0) {
            $scope.hideNoDataFound = false;
          }
        },0)
      })
    }
  }

  $scope.clearFilter =(queryFor)=>{
    $scope.startFilter = false;
    $scope.tran.toDate = null;
    $scope.tran.fromDate = null;
    $scope.getNewData(queryFor);
  };

  $scope.getDataByTable(TRANSACTION_TABLE, TRANSACTION_TABLE,'active','1');

  });
