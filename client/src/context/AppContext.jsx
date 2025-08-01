import { createContext,useContext,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets.js";
import toast from "react-hot-toast";
import axios from "axios"; //used for api calls

axios.defaults.withCredentials=true; //it will send cookies also by api request
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

  const currency=import.meta.env.VITE_CURRENCY;
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

  const [showuserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);

  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  //Fetch seller status

  const fetchSeller=async ()=>{
    try{
      const {data}=await axios.get('/api/seller/is-auth');
      if(data.success){
        setIsSeller(true)
      }
      else{
        setIsSeller(false)
      }
    }catch(error){
      setIsSeller(false)
    }
  }

  //Fetch User Auth status ,user data and cart items
  const fetchUser=async ()=>{
    try{
      const {data} = await axios.get('/api/user/is-auth');
      if(data.success){
        setUser(data.user)
        setCartItems(data.user.cartItem)
      }
    }catch(error){
        setUser(null)
        
    }
  }

  //Fetch All Product
  //setProducts(dummyProducts);
  const fethchProducts = async () => {
         try{
          
          const {data} = await axios.get('/api/product/list')
          if(data.success){
            //setProducts(dummyProducts)
            setProducts(data.products)
          }
          else{
            toast.error(data.message)
          }
         }catch(error){
          toast.error(error.message)
         }
  };


//add product to cart
  const addToCart=(itemId)=>{
    let cartData=structuredClone(cartItems);

    if(cartData[itemId]){
      cartData[itemId]+=1;
    }
    else{
      cartData[itemId]=1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
    //console.log(cartData);
  }

  //update cart item quantity
  const updateCartItem=(itemId,quantity)=>{
    let cartData=structuredClone(cartItems);
    cartData[itemId]=quantity;
    setCartItems(cartData);
    toast.success("Cart Updated")
  }

  //remove product from cart
  const removeFromCart=(itemId)=>{
    let cartData=structuredClone(cartItems);
    if(cartData[itemId]){
      cartData[itemId]-=1;
      if(cartData[itemId]===0){
        delete cartData[itemId];
      }
    }
    toast.success("Removed from Cart");
    setCartItems(cartData);

  }

  const getCartCount = () => {
    let totalcount=0;
    for(const item in cartItems){
      totalcount+=cartItems[item];
    }
    return totalcount;
  }

  //get cart total price
  const getCartAmount = () => {
    let totalAmount=0;
    for(const item in cartItems){
      let itemInfo=products.find((product)=>product._id===item);
      if(cartItems[item]>0){
        totalAmount+=itemInfo.offerPrice*cartItems[item];
      }
    }
    return Math.floor(totalAmount*100)/100;
  }


  useEffect(()=>{
    fetchUser();
    fetchSeller();
    fethchProducts();
  },[])

  //update Database cart items
  useEffect(()=>{
    const updateCart=async()=>{
      try{
        const  {data}=await axios.post('/api/cart/update',{cartItems})

        if(!data.success){
          toast.error(data.message)
        }
      } catch(error){
        toast.error(error.message)
      }
    }
    if(user){

      updateCart()
    }
  },[user,cartItems])

  const value={navigate, user, setUser, isSeller, setIsSeller,showuserLogin,setShowUserLogin,products,currency,
    addToCart,updateCartItem,removeFromCart,cartItems,searchQuery,setSearchQuery,getCartAmount,getCartCount,axios,
    fethchProducts,setCartItems
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => {
    return useContext(AppContext);
};