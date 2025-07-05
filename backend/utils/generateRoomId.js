const generateRoomId = (id1, id2)=>{
    const ids = [id1,id2].map(id=> id.toString()).sort()
    return `${ids[0]}*${ids[1]}`;
}

export {
    generateRoomId
}