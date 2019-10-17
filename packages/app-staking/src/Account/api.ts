export function getStakingHistory({page = 0, row = 10, address}, callback) {
    const axios = require('axios');

    axios.post('https://crayfish.subscan.io/api/scan/staking_history', {
      page:page,
      row:10,
      address: address
    })
      .then((response) => {
        callback && callback(response.data)
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }