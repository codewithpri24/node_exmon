// window.onload = function () {
//   //   const stripe = Stripe(
//   //     "sk_test_51NJLchSHf1YC4BnD77soPvBzTKgcg3kuDNln2FVa7Bjjl2Y4D6XVHS6UEk36D1JVOtmKeNrYan6OSBArVRdu7ada00Jh3Bfm3i"
//   //   );

//   var buy_btn = document.getElementById("buy_Btn");
//   const productId = buy_btn.dataset.id;
//   buy_btn.onclick = async (req, res) => {
//     const session = await axios
//       .get(`http://localhost:3000/checkout/${productId}`)
//       .then(function (response) {
//         console.log(response);
//       });
//     console.log(session, "session1");
//   };
// };
