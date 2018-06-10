
jhora.controller('viewCustomerCtrl', function($rootScope, $scope, $timeout, VIEW_LIMITS, CUSTOMERS_TABLE, DELCUSTOMERS_TABLE) {
    const {shell} = require('electron');
    $scope.limits = VIEW_LIMITS;
    $scope.queryFor = $scope.limits[0];
    $scope.customer = { name: '', mobile: '', village: '', father: '', rate: '', guarantor: '', date: null, pageNo: '', remarks: '' };
    $scope.hideNoDataFound = true;
    $rootScope.template = {title: 'Customers'}
    $scope.editCustomer = (customer)=>{
      // TODO
      $rootScope.editModeData = customer;
      $rootScope.template = {title: 'Edit Customer', content :'customer/updateCustomer.html'};

    };
    $scope.deleteCustomer=(ev,customer)=>{
      shell.beep();
      $rootScope.showDialog(ev,'customer', customer, 'customer/previewCustomer.html','Are you sure to delete...?')
      .then((answer)=>{
        if(answer == 'submit') {
          $scope.confirmCustomer(customer);
        }
      });
  }
    $scope.confirmCustomer = (customer)=>{
            let  {name, mobile, village, father, rate, guarantor, date, pageNo, remarks,salutation } = customer;
            let keys = ['name', 'mobile', 'village', 'father', 'rate', 'guarantor', 'date', 'pageNo', 'remarks','salutation'];
            let values =[name, mobile, village, father, rate, guarantor, date, pageNo, remarks,salutation];
            q.insert(DELCUSTOMERS_TABLE, keys, values)
            .then((data)=>{
              return q.deleteRowById(CUSTOMERS_TABLE, customer.id);
            })
            .then((data)=>{
              $scope.getCustomers(CUSTOMERS_TABLE);
              $rootScope.showToast(`${customer.name}'s Customer Deleted`);
            })
            .catch((err)=>{
              console.error('anp an err occured while deleting', err);
            });
          }

    $scope.sortBy = (propertyName)=>{
      $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
    };

    $scope.getCustomers = (tableName)=>{
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
        }
        $timeout(()=>{
          $scope.hideNoDataFound = true;
          $scope.customers = rows;
          if(rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        },0);
      })
      .catch((err)=>{
        console.error(err);
      });
    };

    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getCustomers(DELCUSTOMERS_TABLE);
      }else{
        $scope.getCustomers(CUSTOMERS_TABLE);
      }
    };
    $scope.getCustomers(CUSTOMERS_TABLE);

   $scope.viewCustomerPassbook = (customer)=>{
    // TODO
    $rootScope.viewPassbookData = customer;
    $rootScope.template = {title: `Passbook for A/c No.-${customer.id}` , content :'passbook/viewPassbook.html'};
   };

  });
