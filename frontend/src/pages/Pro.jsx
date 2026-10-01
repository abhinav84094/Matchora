

export default Pro = async ()=> {

    try{
        const resource = await fetch(`${API_URL}/api/study/resources`, {
            credentials: "include",
        });

        console.log(resource)
    }
    catch(err){
        console.log(err)
    }

    <>
        <div>pro page</div>

    </>
}