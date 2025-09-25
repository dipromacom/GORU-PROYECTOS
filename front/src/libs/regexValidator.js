const regexValidator  = (e,regex = /.*/g,fn=e=>{}) => {
    const { value: newValue } = e.target;
    if(!(newValue||"")){
        fn("")
    }
    if (regex.test(newValue)) {
        fn(newValue)
    }
}




export default regexValidator;