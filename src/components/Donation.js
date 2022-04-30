// import React, {useState} from 'react';

// import {
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import RazorpayCheckout from 'react-native-razorpay';
// import {windowHeight} from '../common';
// import CustomModal from './CustomModal';
// const Donations = () => {
//   const [num, setNum] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [isModalVisible, setModalVisible] = useState(false);

//   const handlePress = (name, amount) => {
//     let finalAmount = amount * 100;

//     var options = {
//       description: name,
//       image:
//         'https://raw.githubusercontent.com/samadritsarkar2/spotifyDown/main/src/assets/homeLogo.png',
//       currency: 'INR',
//       key: 'rzp_live_4WPra5TfgDBu25', // live api key
//       amount: finalAmount,
//       name: 'Samadrit Sarkar',
//       //order_id: 'order_DslnoIgkIDL8Zt', //Replace this with an order_id created using Orders API.

//       theme: {color: '#1DB954', backdrop_color: '#1DB954'},
//     };
//     RazorpayCheckout.open(options)
//       .then((data) => {
//         setModalVisible(true);
//         setSuccess(true);
//       })
//       .catch((error) => {
//         setModalVisible(true);
//         setSuccess(false);
//       });
//   };

//   const toggleModal = () => {
//     setModalVisible(!isModalVisible);
//   };

//   const handleCustomAmount = () => {
//     if (num !== '') {
//       let finalVal = parseInt(num, 10);
//       // console.log(finalVal, num);
//       if (finalVal < 1) {
//         Alert.alert('Please enter amount greater than or equal to Re. 1');
//         setNum('');
//       } else {
//         handlePress('Custom', finalVal);
//       }
//     }
//   };

//   return (
//     <>
//       <View style={{flex: 1, paddingHorizontal: 10}}>
//         <Text style={styles.heading}>Support the App</Text>

//         <ScrollView style={styles.scroller}>
//           <View style={styles.header}>
//             <Text style={styles.subHeading}>
//               Downify is{' '}
//               <Text style={{textDecorationLine: 'line-through'}}>Ad-free</Text>
//               {'( having little ads) '} just to continue its development and
//               reimburse the server costs. More updates and features on its way.
//             </Text>
//             <Text style={[styles.subHeading]}>
//               To support us, you can donate any amount or from the options
//               below. Thank you for your support! You are awesome 🎉
//             </Text>
//           </View>

//           <TouchableOpacity onPress={() => handlePress('Tea', 10)}>
//             <View style={styles.optionWrapper}>
//               <Text style={styles.optionText}>Tea{'  '}☕</Text>
//               <Text style={styles.optionSubText}>Rs. 10</Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handlePress('Pastry', 49)}>
//             <View style={styles.optionWrapper}>
//               <Text style={styles.optionText}>Pastry{'  '}🍰</Text>
//               <Text style={styles.optionSubText}>Rs. 49</Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handlePress('Pizza', 149)}>
//             <View style={styles.optionWrapper}>
//               <Text style={styles.optionText}>Pizza {'  '}🍕</Text>
//               <Text style={styles.optionSubText}>Rs. 149</Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => handlePress('56 bhog', 2000)}>
//             <View style={styles.optionWrapper}>
//               <Text style={styles.optionText}>56 bhog{'  '}🍱 </Text>
//               <Text style={styles.optionSubText}>Rs. 2000</Text>
//             </View>
//           </TouchableOpacity>
//           <View onPress={() => {}}>
//             <View style={[styles.optionWrapper]}>
//               <TextInput
//                 style={{
//                   color: 'white',
//                   width: '50%',
//                   borderBottomColor: 'white',
//                   borderBottomWidth: 1,
//                   alignSelf: 'center',
//                 }}
//                 keyboardType={'number-pad'}
//                 returnKeyType={'done'}
//                 placeholder={'Enter Custom Amount'}
//                 placeholderTextColor={'#B3B3b3'}
//                 value={num}
//                 onChangeText={(val) => {
//                   setNum(val);
//                 }}
//                 onSubmitEditing={() => handleCustomAmount()}
//               />
//               <TouchableOpacity
//                 style={[
//                   styles.optionText,
//                   {
//                     height: '100%',
//                     paddingLeft: '7%',
//                     justifyContent: 'center',
//                   },
//                 ]}
//                 onPress={() => handleCustomAmount()}>
//                 <Text style={[styles.optionText, {textAlign: 'center'}]}>
//                   Submit
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={{height: windowHeight * 0.07}} />
//         </ScrollView>
//       </View>
//       <CustomModal
//         isModalVisible={isModalVisible}
//         toggleModal={toggleModal}
//         title={success ? 'Thank You ❤' : 'So sad 💔'}
//         text={
//           success
//             ? 'Your contribution means a lot to me. Thanks for encoraging and supporting the project.'
//             : 'The donation somehow failed. Its okay, atleast you thought of donating, it means a lot. Keep using the app, it encourages me too.'
//         }
//       />
//     </>
//   );
// };

// export default Donations;

// const styles = StyleSheet.create({
//   header: {
//     flex: 0.4,
//     marginHorizontal: '1%',
//     marginBottom: windowHeight * 0.05,
//   },
//   heading: {
//     color: '#1DB954',
//     fontFamily: 'Roboto',
//     fontWeight: 'bold',
//     fontSize: 40,
//     alignSelf: 'center',
//     marginTop: '5%',
//   },
//   subHeading: {
//     color: 'white',
//     fontFamily: 'Montserrat-Regular',
//     alignSelf: 'center',
//     fontSize: 16,
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   scroller: {
//     flex: 0.9,
//     marginTop: windowHeight * 0.01,
//   },
//   optionWrapper: {
//     flex: 1,
//     margin: 10,
//     paddingVertical: 20,
//     paddingHorizontal: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignContent: 'center',
//     alignItems: 'baseline',
//     backgroundColor: '#111111',
//     borderRadius: 10,
//   },
//   optionText: {
//     color: 'white',
//     fontSize: 18,
//     fontFamily: 'GothamMedium',
//   },
//   optionSubText: {
//     color: '#6C7A89',
//     fontSize: 15,
//     fontFamily: 'GothamMedium',
//   },
// });
