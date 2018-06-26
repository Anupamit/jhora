jhora.controller('addViewVillageCtrl', function($rootScope, $scope, $timeout, $mdDialog, VIEW_LIMITS,CUSTOMERS_TABLE, TRANSACTION_TABLE, VILLAGE_TABLE){

  const {dialog} = require('electron').remote;
	const {shell} = require('electron');
	$rootScope.template = {title: 'Add / View Villages'};
	$scope.village = { name : ''} ;
	$scope.limits = VIEW_LIMITS;
  $scope.queryFor = $scope.limits[0];
	$scope.hideNoDataFound = true;
	$rootScope.editModeData = false;

	$scope.resetVillage = ()=>{
      $scope.village ={};
      $scope.villageForm.$setPristine();
      $scope.villageForm.$setUntouched();
      $rootScope.editModeData = false;
      $rootScope.template.title = 'Add / View Villages';
    };

    $scope.addVillage = (ev)=>{
      let keys = Object.keys($scope.village);
      let values = Object.values($scope.village);
      if($rootScope.editModeData == true){
		    q.update(VILLAGE_TABLE, keys, values, 'id', $scope.village.id)
		      .then((data)=>{
		      	$timeout(()=>{
			          $scope.resetVillage();
			        },0);
							$rootScope.showToast('Village updated');
		           $scope.getVillages(VILLAGE_TABLE);
							 $rootScope.template = {title: 'Villages'};
		    })
		    .catch((err)=>{
		          console.error('anp err occured while updation',err);
		          $scope.getError(ev, err);
		    });
        }
        else{
			   q.insert(VILLAGE_TABLE, keys, values)
			    .then((data)=>{
			        $timeout(()=>{
			          $scope.resetVillage();
			        },0);
							$rootScope.showToast('Village Added');
			          $scope.getVillages(VILLAGE_TABLE);
								$rootScope.template = {title: 'Villages'};
			    })
			    .catch((err)=>{
			          console.error('anp err occured while insertion',err);
			          $scope.getError(ev, err);
			});
    };
	};

	$scope.getError = (ev, error) => {
		if (error.code=="SQLITE_CONSTRAINT") {
			$rootScope.showAlertDialog(ev,'Duplicate Village Found', `Village : ${$scope.village.name} is already exists.`);
			$scope.resetVillage();
		}
	};

    $scope.getNewData= (queryFor)=>{
      if(queryFor == $scope.limits[1]) {
        $scope.getVillages(VILLAGE_TABLE);
      }else{
        $scope.getVillages(VILLAGE_TABLE);
      }
    };

    $scope.getVillages = (tableName)=>{
      q.takeBackup(tableName)
      .then((data)=>{
        console.log('anp data came', data);
      }).catch((err)=>{
        console.log('anp err came', err);
      })
      q.selectAll(tableName)
      .then((rows)=>{
        if(rows)
        for(let row of rows){
          row.date = row.date ? new Date(row.date) : null;
        }
        $timeout(()=>{
          $scope.villages = rows;
					$scope.hideNoDataFound = true;
          if(tableName == VILLAGE_TABLE && rows && rows.length == 0)
          $scope.hideNoDataFound = false;
        },0);
      })
      .catch((err)=>{
        console.error(err);
      });
    };
    $scope.getVillages(VILLAGE_TABLE);
		$scope.deleteVillage = (ev,village)=>{
			shell.beep();
      q.selectAllById(CUSTOMERS_TABLE,'village',village.name)
      .then((rows)=>{
        if (rows.length>0) {
          $rootScope.showAlertDialog(ev,`Village in Use`, `Village : ${village.name} unable to delete .`);
        }
        else{
			       let confirm = $mdDialog.confirm()
		         .title('Delete Village')
		         .textContent(`Are you sure to delete village: ${village.name} ?`)
		         .ariaLabel('Delete')
		         .targetEvent(ev)
		         .ok('Submit')
		         .cancel('Cancel');
			          $mdDialog.show(confirm,village).then(function() {
				      $scope.confirmVillage(village);
				   },function() {
           });
         }
       }
     )
	  };
    $scope.confirmVillage = (village)=>{
        let  {name} = village;
        let keys = ['name'];
        let values =[name];
        return q.deleteRowById(VILLAGE_TABLE, village.id)
          .then((data)=>{
          $scope.getVillages(VILLAGE_TABLE);
					$rootScope.showToast('Village Deleted');
        })
        .catch((err)=>{
          console.error('anp an err occured while deleting', village);
        });
    }

});
