import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import Lottie from 'lottie-react-native'; // Import Lottie
import animation from '../animat.json'; // Go back one directory to access the JSON file

// Loader component with animation
const Loader = () => (
  <View style={styles.loaderContainer}>
    <Lottie source={animation} autoPlay loop /> {/* Play the Lottie animation */}
  </View>
);

// Convert English numbers to Persian numbers
const convertToPersianNumbers = (num) => {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (digit) => persianNumbers[digit]);
};

// Format the number according to the specified rules
const formatNumber = (input) => {
  const num = input.replace(/\D/g, "");
  if (num.length === 0) return "";

  let formatted;
  let tempNum = num;

  // Format based on length
  if (num.length <= 3) {
    formatted = num;
  } else {
    const segments = [];
    while (tempNum.length > 3) {
      segments.unshift(tempNum.slice(-3));
      tempNum = tempNum.slice(0, -3);
    }
    segments.unshift(tempNum);
    formatted = segments.join(".");
  }

  return formatted;
};

const MainApp = () => {
  const [amount, setAmount] = useState("");
  const [initialDate, setInitialDate] = useState({ day: "", month: "", year: "" });
  const [targetDate, setTargetDate] = useState({ day: "", month: "", year: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const calculateValue = () => {
    setErrorMessage("");
    const { day: initialDay, month: initialMonth, year: initialYear } = initialDate;
    const { day: targetDay, month: targetMonth, year: targetYear } = targetDate;

    // Validate input fields
    if (!initialDay || !initialMonth || !initialYear ||
        !targetDay || !targetMonth || !targetYear || 
        !amount || parseFloat(amount.replace(/\./g, '')) <= 0) {
      Alert.alert("خطا", "لطفا همه فیلدها را پر کنید و مقدار صحیحی وارد کنید.");
      return;
    }

    const initial = new Date(initialYear, initialMonth - 1, initialDay);
    const target = new Date(targetYear, targetMonth - 1, targetDay);

    // Validate date range
    if (initial >= target) {
      setErrorMessage("تاریخ ها بدرستی وارد نشده اند");
      return;
    }

    // Calculate future value based on simple interest formula
    const timeDifferenceInMonths = (target.getFullYear() - initial.getFullYear()) * 12 + (target.getMonth() - initial.getMonth());
    const t = timeDifferenceInMonths / 12; // Convert to years
    const i = 0.43; // Example interest rate
    const n = 1; // Compounding frequency
    const futureValue = parseFloat(amount.replace(/\./g, '')) * Math.pow(1 + i / n, n * t);

    setResult(`ارزش پول شما به تومان در تاریخ ${convertToPersianNumbers(targetYear)}/${convertToPersianNumbers(targetMonth)}/${convertToPersianNumbers(targetDay)} برابر با: ${convertToPersianNumbers(futureValue.toFixed(2))} است.`);
    setModalVisible(true);
  };

  const handleAmountChange = (input) => {
    const formattedValue = formatNumber(input);
    setAmount(formattedValue);
  };

  // Custom Picker Component
  const CustomPicker = ({ selectedValue, onValueChange, items, placeholder }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <View style={styles.customPickerContainer}>
        <TouchableOpacity
          onPress={() => setIsVisible(true)}
          style={styles.customPicker}
        >
          <Text style={[styles.selectedValue, { color: '#808080' }]}>
            {selectedValue || placeholder}
          </Text>
        </TouchableOpacity>

        <Modal
          transparent
          visible={isVisible}
          animationType="slide"
          onRequestClose={() => setIsVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView style={styles.scrollView}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => {
                      onValueChange(item.value);
                      setIsVisible(false);
                    }}
                    style={styles.pickerItem}
                  >
                    <Text style={styles.pickerText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>بستن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // Prepare day, month, and year options for pickers
  const days = Array.from({ length: 31 }, (_, i) => ({ label: convertToPersianNumbers(i + 1), value: i + 1 }));
  const months = Array.from({ length: 12 }, (_, i) => ({ label: convertToPersianNumbers(i + 1), value: i + 1 }));
  const years = Array.from({ length: 84 }, (_, i) => ({ label: convertToPersianNumbers(1403 - i), value: 1403 - i }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>محاسبه ارزش پول</Text>
      </View>

      {/* Input for amount */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="مقدار پول را به تومان وارد کنید"
          keyboardType="numeric"
          value={amount}
          onChangeText={handleAmountChange}
          textAlign="right"
          placeholderTextColor="#808080"
        />
      </View>

      {/* Initial Date Picker */}
      <View style={styles.datePickerGroup}>
        <Text style={styles.inputLabel}>زمانی که پول دادم یا گرفتم:</Text>
        <View style={styles.datePickers}>
          <CustomPicker
            selectedValue={initialDate.year}
            onValueChange={(value) => setInitialDate({ ...initialDate, year: value })}
            items={years}
            placeholder="سال"
          />
          <CustomPicker
            selectedValue={initialDate.month}
            onValueChange={(value) => setInitialDate({ ...initialDate, month: value })}
            items={months}
            placeholder="ماه"
          />
          <CustomPicker
            selectedValue={initialDate.day}
            onValueChange={(value) => setInitialDate({ ...initialDate, day: value })}
            items={days}
            placeholder="روز"
          />
        </View>
      </View>

      {/* Target Date Picker */}
      <View style={styles.datePickerGroup}>
        <Text style={styles.inputLabel}>ارزش پول در این تاریخ:</Text>
        <View style={styles.datePickers}>
          <CustomPicker
            selectedValue={targetDate.year}
            onValueChange={(value) => setTargetDate({ ...targetDate, year: value })}
            items={years}
            placeholder="سال"
          />
          <CustomPicker
            selectedValue={targetDate.month}
            onValueChange={(value) => setTargetDate({ ...targetDate, month: value })}
            items={months}
            placeholder="ماه"
          />
          <CustomPicker
            selectedValue={targetDate.day}
            onValueChange={(value) => setTargetDate({ ...targetDate, day: value })}
            items={days}
            placeholder="روز"
          />
        </View>
      </View>

      {/* Calculate Button */}
      <TouchableOpacity style={styles.calculateButton} onPress={calculateValue}>
        <Text style={styles.buttonText}>محاسبه کن</Text>
      </TouchableOpacity>

      {/* Error message display */}
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

      {/* Result Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>نتیجه محاسبه</Text>
            <Text style={styles.popupContent}>{result}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.popupButton}>بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>@تمام حقوق متعلق به هزار ویترین می باشد</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:atashzaban.e@gmail.com')}>
          <Text style={styles.footerLink}>برای هرگونه انتقاد یا پیشنهاد کلیک بفرمایید</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    // Hide the loader after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3000 milliseconds for 3 seconds

    return () => clearTimeout(timer); // Cleanup on component unmount
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {loading ? <Loader /> : <MainApp />} {/* Show loader or main app based on loading state */}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Set background color to #F5F5F5
  },
  loaderText: {
    color: 'white',
    fontSize: 20,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    alignItems: "center",
  },
  header: {
    marginBottom: 35,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginTop: 100, // Increased marginTop from 50 to 100
    color: "black",
    fontFamily: "Titr",
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
    backgroundColor: "white",
    borderRadius: 5,
  },
  input: {
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
    textAlign: "right",
    backgroundColor: "white",
    fontFamily: "Titr",
  },
  datePickerGroup: {
    marginBottom: 20,
    width: '100%',
    alignItems: "center",
  },
  inputLabel: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Titr",
    marginBottom: 10,
  },
  datePickers: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
  },
  customPickerContainer: {
    width: "30%",
  },
  customPicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    zIndex: 2,
  },
  selectedValue: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Titr",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 5,
    elevation: 10,
  },
  scrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 10,
  },
  pickerText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Titr",
    color: "#000",
  },
  closeButton: {
    backgroundColor: '#B000FF',
    padding: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  calculateButton: {
    marginTop: 20,
    backgroundColor: "#B000FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Titr",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#3F00FF",
    textAlign: "center",
  },
  popupContent: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Titr",
  },
  popupButton: {
    backgroundColor: "#B000FF",
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    textAlign: "center",
    fontFamily: "Titr",
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  footerLink: {
    color: "#3F00FF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default App;