import React, { useState } from "react";
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
import { Picker } from "@react-native-picker/picker";

// Convert English numbers to Persian numbers
const convertToPersianNumbers = (num) => {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (digit) => persianNumbers[digit]);
};

// Format the number according to the specified rules
const formatNumber = (input) => {
  const num = input.replace(/\D/g, ""); // Remove non-digit characters
  if (num.length === 0) return "";

  let formatted;
  
  // Handle formatting based on the length of the number
  const length = num.length;
  
  if (length <= 3) {
    formatted = num; // x, xx, xxx
  } else if (length <= 6) {
    formatted = num.slice(0, -3) + (num.length > 3 ? "." + num.slice(-3) : ""); // x.xxx, xx.xxx, xxx.xxx
  } else if (length <= 9) {
    formatted = num.slice(0, -6) + (num.length > 6 ? "." + num.slice(-6, -3) + "." + num.slice(-3) : ""); // x.xxx.xxx, xx.xxx.xxx, xxx.xxx.xxx
  } else if (length <= 12) {
    formatted = num.slice(0, -9) + (num.length > 9 ? "." + num.slice(-9, -6) + "." + num.slice(-6, -3) + "." + num.slice(-3) : ""); // x.xxx.xxx.xxx, xx.xxx.xxx.xxx, xxx.xxx.xxx.xxx
  } else {
    formatted = num.slice(0, -12) + (num.length > 12 ? "." + num.slice(-12, -9) + "." + num.slice(-9, -6) + "." + num.slice(-6, -3) + "." + num.slice(-3) : ""); // x.xxx.xxx.xxx.xxx, xx.xxx.xxx.xxx.xxx, xxx.xxx.xxx.xxx.xxx
  }

  return formatted;
};

const App = () => {
  const [amount, setAmount] = useState("");
  const [initialDate, setInitialDate] = useState({ day: "", month: "", year: "" });
  const [targetDate, setTargetDate] = useState({ day: "", month: "", year: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const calculateValue = () => {
    setErrorMessage("");
    const { day: initialDay, month: initialMonth, year: initialYear } = initialDate;
    const { day: targetDay, month: targetMonth, year: targetYear } = targetDate;

    if (!initialDay || !initialMonth || !initialYear || !targetDay || !targetMonth || !targetYear || !amount || amount <= 0) {
      Alert.alert("Error", "لطفا همه فیلدها را پر کنید و مقدار صحیحی وارد کنید.");
      return;
    }

    const initial = new Date(initialYear, initialMonth - 1, initialDay);
    const target = new Date(targetYear, targetMonth - 1, targetDay);

    if (initial >= target) {
      setErrorMessage("تاریخ ها بدرستی وارد نشده اند");
      return;
    }

    const timeDifferenceInMonths = (target.getFullYear() - initial.getFullYear()) * 12 + (target.getMonth() - initial.getMonth());
    const t = timeDifferenceInMonths / 12; // Convert to years
    const i = 0.43; // Example interest rate
    const n = 1; // Compounding frequency
    const futureValue = amount * Math.pow(1 + i / n, n * t);

    setResult(`ارزش پول شما به تومان در تاریخ ${convertToPersianNumbers(targetYear)}/${convertToPersianNumbers(targetMonth)}/${convertToPersianNumbers(targetDay)} برابر با: ${convertToPersianNumbers(futureValue.toFixed(2))} است.`);
    setModalVisible(true);
  };

  const handleAmountChange = (input) => {
    const formattedValue = formatNumber(input);
    setAmount(formattedValue);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ marginBottom: 35 }}>
        <Text style={styles.title}>محاسبه ارزش پول</Text>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="مقدار پول را وارد کنید"
          keyboardType="numeric"
          value={amount}
          onChangeText={handleAmountChange}
          textAlign="right"
        />
      </View>

      <View style={styles.datePickerGroup}>
        <Text style={styles.inputLabel}>زمانی که پول دادم یا گرفتم:</Text>
        <View style={styles.datePickers}>
          <Picker
            selectedValue={initialDate.day}
            style={styles.picker}
            onValueChange={(itemValue) => setInitialDate({ ...initialDate, day: itemValue })}
          >
            <Picker.Item label="روز" value="" />
            {[...Array(31).keys()].map((i) => <Picker.Item key={i + 1} label={convertToPersianNumbers(i + 1)} value={i + 1} />)}
          </Picker>
          <Picker
            selectedValue={initialDate.month}
            style={styles.picker}
            onValueChange={(itemValue) => setInitialDate({ ...initialDate, month: itemValue })}
          >
            <Picker.Item label="ماه" value="" />
            {[...Array(12).keys()].map((i) => <Picker.Item key={i + 1} label={convertToPersianNumbers(i + 1)} value={i + 1} />)}
          </Picker>
          <Picker
            selectedValue={initialDate.year}
            style={styles.picker}
            onValueChange={(itemValue) => setInitialDate({ ...initialDate, year: itemValue })}
          >
            <Picker.Item label="سال" value="" />
            {[...Array(84).keys()].map((i) => <Picker.Item key={1403 - i} label={convertToPersianNumbers(1403 - i)} value={1403 - i} />)}
          </Picker>
        </View>
      </View>

      <View style={styles.datePickerGroup}>
        <Text style={styles.inputLabel}>ارزش پول در این تاریخ:</Text>
        <View style={styles.datePickers}>
          <Picker
            selectedValue={targetDate.day}
            style={styles.picker}
            onValueChange={(itemValue) => setTargetDate({ ...targetDate, day: itemValue })}
          >
            <Picker.Item label="روز" value="" />
            {[...Array(31).keys()].map((i) => <Picker.Item key={i + 1} label={convertToPersianNumbers(i + 1)} value={i + 1} />)}
          </Picker>
          <Picker
            selectedValue={targetDate.month}
            style={styles.picker}
            onValueChange={(itemValue) => setTargetDate({ ...targetDate, month: itemValue })}
          >
            <Picker.Item label="ماه" value="" />
            {[...Array(12).keys()].map((i) => <Picker.Item key={i + 1} label={convertToPersianNumbers(i + 1)} value={i + 1} />)}
          </Picker>
          <Picker
            selectedValue={targetDate.year}
            style={styles.picker}
            onValueChange={(itemValue) => setTargetDate({ ...targetDate, year: itemValue })}
          >
            <Picker.Item label="سال" value="" />
            {[...Array(84).keys()].map((i) => <Picker.Item key={1403 - i} label={convertToPersianNumbers(1403 - i)} value={1403 - i} />)}
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={calculateValue}>
        <Text style={styles.buttonText}>محاسبه کن</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      <Modal
        animationType="slide"
        transparent={true}
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

      <View style={styles.footer}>
        <Text>تمام حقوق متعلق به هزار ویترین می باشد@</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:atashzaban.e@gmail.com')}
        >
          <Text style={styles.footerLink}>
            برای هرگونه انتقاد یا پیشنهاد کلیک یفرمایید
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D4EDDA",
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 31,
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
    color: "black",
    fontFamily: "Titr",
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 15,
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  input: {
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 20,
    textAlign: "right",
    backgroundColor: "white",
    fontFamily: "Titr",
  },
  datePickerGroup: {
    marginBottom: 20,
    alignItems: "center",
  },
  inputLabel: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Titr",
    marginBottom: 30,
  },
  datePickers: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: '100%',
  },
  picker: {
    height: 50,
    width: "30%",
    backgroundColor: "white",
  },
  calculateButton: {
    marginTop: 20,
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "center",
    width: "80%",
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
    color: "#28a745",
    textAlign: "center",
  },
  popupContent: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Titr",
  },
  popupButton: {
    backgroundColor: "#28a745",
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
    color: "#28a745",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
