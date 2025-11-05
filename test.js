
// testVariables(true)


// function testVariables(param){
//     let y = 2;
//     console.log(x); // stie ca exista x creat dar da undefiend la rulare pentru ca nu este initializat doar creat.
//     if(param === true){
//         var x = 5;
//         let y = 6; // variabila asta dispare dupa
//         const z = 7;
//     }

//     console.log(x);
//     console.log(y); // eroare generata de faptul ca y se distruge la final de bloc
//     console.log(z);

// }

// testVariables(true)


// testVariables2(true) // nu poate fi apelata functia const inainte

const testVariables2 = (param) => {
    console.log(x); // stie ca exista x creat dar da undefiend la rulare pentru ca nu este initializat doar creat.
    if(param === true){
        var x = 5;
        let y = 6; // variabila asta dispare dupa
        const z = 7;
    }

    console.log(x);
    console.log(y); // eroare generata de faptul ca y se distruge la final de bloc
    console.log(z);
}

testVariables2(true)