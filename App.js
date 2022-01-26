import { StatusBar } from "expo-status-bar";
import { Fontisto, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./color";
// import { loadStaticPaths } from "next/dist/server/dev/static-paths-worker";

const STORAGE_KEY = "@toDos";
const STORAGE_KEY2 = "@working";

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

function clearAllData() {
  AsyncStorage.getAllKeys()
    .then((keys) => AsyncStorage.multiRemove(keys))
    .then(() => alert("success"));
}

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editing, setEditing] = useState(-1);
  useEffect(() => {
    console.log("working?", working);
  }, [working]);
  useEffect(() => {
    loadToDos();
    loadStatus();
  }, []);
  // const emojis = {"thumb":"👍", "heart":"❤️", "perfect":"💯"};
  const emojis = ["👍", "❤️", "💯"];

  const travel = () => {
    setWorking(false);
    saveStatus(JSON.stringify({ working: false }));
  };
  const work = () => {
    setWorking(true);
    saveStatus(JSON.stringify({ working: true }));
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const saveStatus = async (work) => {
    await AsyncStorage.setItem(STORAGE_KEY2, work);
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
      console.log(s);
    } catch {
      setToDos({});
    }
  };
  const loadStatus = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY2);
      const ss = JSON.parse(s);
      setWorking(ss["working"]);
      console.log("📌working??", s, ss["working"]);
    } catch {
      setWorking(true);
    }
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    // save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, work: working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  // console.log(toDos);

  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this todo?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm sure",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }

    return;
  };

  const changeToDo = async (key, type, value) => {
    let newToDos = { ...toDos };
    newToDos[key][type] = value;
    console.log(newToDos);
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const exitEdit = async (key) => {
    await changeToDo(key, "text", text);
    setText("");
    setEditing(-1);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          {console.log("render working? ", working)}
          <Text
            style={{
              fontSize: 38,
              fontWeight: "800",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearAllData}>
          <Text style={{ color: "red" }}>reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "800",
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        onSubmitEditing={addTodo}
        returnKeyType="done"
      />
      <ScrollView>
        {toDos &&
          Object.keys(toDos).map((key) =>
            toDos[key].work === working ? (
              <View key={key} style={styles.toDo}>
                <View style={styles.toDoLeft}>
                  <TouchableOpacity
                    onPress={() => changeToDo(key, "done", !toDos[key].done)}
                  >
                    {toDos[key].done == (undefined || false) ? (
                      <Feather name="circle" size={24} color="white" />
                    ) : (
                      <Feather
                        name="check-circle"
                        size={24}
                        color={theme.grey}
                      />
                    )}
                  </TouchableOpacity>

                  {editing != key && (
                    <Text
                      style={{
                        ...styles.toDoText,
                        color:
                          toDos[key].done == (undefined || false)
                            ? "white"
                            : theme.grey,
                        textDecorationLine:
                          toDos[key].done == (undefined || false)
                            ? "none"
                            : "line-through",
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                  )}
                  {editing == key && (
                    <TextInput
                      style={styles.editInput}
                      onChangeText={onChangeText}
                      onSubmitEditing={() => {
                        exitEdit(key);
                      }}
                      returnKeyType="done"
                      placeholderTextColor={theme.grey}
                    >
                      {toDos[key].text}
                    </TextInput>
                  )}
                </View>

                {editing != key && (
                  <View style={styles.toDoRight}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditing(key);
                        setText(toDos[key].text);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={22}
                        color={theme.iconGrey}
                        style={styles.iconFont}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto
                        name="trash"
                        size={18}
                        color={theme.iconGrey}
                        style={styles.iconFont}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {editing == key && (
                  <View style={styles.toDoRight}>
                    <TouchableOpacity onPress={() => exitEdit(key)}>
                      <MaterialCommunityIcons
                        name="circle-edit-outline"
                        size={24}
                        color={theme.iconGrey}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toDoRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 5,
    padding: 1,
    paddingHorizontal: 5,
  },
  iconFont: {
    marginHorizontal: 4,
  },
  editInput: {
    marginHorizontal: 5,
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    color: "white",
    borderRadius: 10,
    padding: 1,
    paddingHorizontal: 5,
    fontSize: 16,
  },
});
