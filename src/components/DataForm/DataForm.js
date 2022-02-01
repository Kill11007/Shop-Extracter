import React, { useEffect, useState } from 'react';
import './DataForm.css';
import axios from 'axios';
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng
} from "react-places-autocomplete";


function DataForm() {

    const initialShop = {
        ownerName: '',
        shopName: '',
        category: [''],
        address: '',
        email: '',
        phone: ['']
    };

    const [error, setError] = useState(false);
    const [myShops, setmyShops] = useState([initialShop]);
    const [allShops, setallShops] = useState([]);
    const [imgCount, setimgCount] = useState(0);
    const [count, setcount] = useState(1);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState([]);
    const initialImage = 'https://www.pngarts.com/files/2/Upload-Transparent-Images.png';
    const finalImage = 'https://i0.wp.com/indigo.careers/wp-content/uploads/2019/10/Thank-you-image.jpg?fit=620%2C300&ssl=1';
    const [region, setregion] = useState('');
    const [coordinates, setCoordinates] = React.useState({
        lat: null,
        lng: null
    });

    // Get all the categories on page load
    useEffect(() => {
        // Api request
        axios.get('https://profilebaba.com/api/get-category')
            .then(res => {
                setAllCategories(res.data.data);
            })
            .catch(e => console.log('Error :', e));
    }, []);


    // Image Upload Handler
    const imageHandler = (event) => {
        var files = Object.entries(event.target.files).map((val) => {
                return URL.createObjectURL(val[1])
            });

        setSelectedFile([...files]);
        setmyShops([initialShop]);
        setcount(1);
        setimgCount(0);

        // To upload the same images again
        event.target.value = '';
    }

    // Delete shop
    const deleteShop = (e) => {
        let k = e.target.getAttribute('id');
        myShops.splice(k, 1);

        setmyShops([...myShops]);
        setcount(count - 1);
    }

    // Append phones..................
    const phoneAppend = (e) => {
        let id = e.target.getAttribute('id');
        let name = e.target.getAttribute('name');
        myShops[id][name].push('');

        setmyShops([...myShops]);
    }

    // Delete Phone
    const deletePhone = (e) => {
        let id = e.target.getAttribute('id');
        let name = e.target.getAttribute('name');
        let ind = e.target.getAttribute('data-index');
        myShops[id][name].splice(ind, 1);

        setmyShops([...myShops]);
    }

    // Validate phone no
    const validatePhoneNumber = (e) => {
        let val = e.target.value;

        // Api request check if phone exits in database or not
        axios.post('https://profilebaba.com/api/user-validate', { "phone_number": val })
            .then(res => {
                if (res.data.success === false) {
                    setError('Phone not valid');
                }
                else {
                    setError(false);
                }
            })
            .catch(e => {
                console.log('Error :', e);
                setError('Phone not valid');
            });
    }

    // onChange of states or inputs..................
    const onChangeHandeler = (e) => {
        let id = e.target.getAttribute('id');
        let getName = e.target.name;
        let val = e.target.value;
        let ind = e.target.getAttribute('data-index');

        if ((getName === 'phone') || (getName === 'category')) {
            myShops[id][getName][ind] = val;
        }
        else {
            myShops[id][getName] = val;
        }

        setmyShops([...myShops]);
        setError(false);
    }

    // Append shops to fill details..................
    const shopDivAppend = () => {
        myShops.push({
            ownerName: '',
            shopName: '',
            category: [''],
            address: '',
            email: '',
            phone: ['']
        });

        setcount(count + 1);
        setmyShops([...myShops]);
    }

    // Save and Next
    const saveAndNext = () => {

        let validatePhone = true;
        let validateCategory = true;
        let validateShopName = true;
        let validateRegion = true;

        // Check if phone is empty
        for (var i = 0; i < myShops.length; i++) {
            validatePhone = myShops[i].phone.some((val) => { return val === '' }) ? false : true;
            if (validatePhone === false) {
                break;
            }
        }

        // Check if category is empty
        for (var j = 0; j < myShops.length; j++) {
            validateCategory = myShops[j].category.some((val) => { return val === '' }) ? false : true;
            if (validateCategory === false) {
                break;
            }
        }

        // Check if Shop name is empty
        for (var k = 0; k < myShops.length; k++) {
            if (myShops[k].shopName === '') {
                validateShopName = false;
                break;
            }
        }

        // If region is empty
        if (region === '') {
            validateRegion = false;
        }

        // Validating here
        if (validateRegion && validatePhone && validateCategory && validateShopName) {
            setallShops([...allShops, ...myShops]);
            setimgCount(imgCount + 1);
            setmyShops([initialShop]);
            setcount(1);
            setError(false);
        }
        else {
            let myError = validateRegion ? (validatePhone ? (validateCategory ? (validateShopName ? null : "Shop Name") : "Category") : "Phone number") : "Region at the top left";
            setError(myError);
        }

    }

    // Submit all images
    const submitAllImages = () => {
        var proceed = window.confirm("Are you sure you want to Submit the changes?");
        if (proceed) {
            var data = allShops.map((values) => {
                var x = {
                    name: (values.ownerName === '') ? values.shopName : values.ownerName,
                    business_name: values.shopName,
                    category: values.category,
                    phone_number: values.phone,
                    address: values.address,
                    email: values.email,
                    area: region,
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                };
                return x
            });

            // Api request submit all shops
            axios.post('https://profilebaba.com/api/add-vendor', data)
                .then(res => {
                    if (res.data.success) {
                        setimgCount(0);
                        setmyShops([initialShop]);
                        setcount(1);
                        setError(false);
                        setallShops([]);
                        setSelectedFile([]);
                        setregion('');
                        alert('Successfully Submitted all image data. Thankyou!');
                    }
                    else {
                        alert('Sorry! Got error while submitting. Please Try again...');
                    }
                })
                .catch(e => {
                    console.log('Error :', e)
                    alert('Sorry! Got error while submitting. Please Try again...');
                });
        }
    }

    // Region Selector
    const handleSelectRegion = async value => {
        const results = await geocodeByAddress(value);
        const latLng = await getLatLng(results[0]);
        setregion(value);
        setCoordinates(latLng);
    };

    // Next Button
    const nextNext = () => {
        var proceed = window.confirm("Changes will not be saved, go to next image?");
        if (proceed) {
            setimgCount(imgCount + 1);
            setmyShops([initialShop]);
            setcount(1);
            setError(false);
        }
    }


    return (
        <>
            <div className='region-image-range'>
                {/* // Select Region */}
                <PlacesAutocomplete
                    value={region}
                    onChange={setregion}
                    onSelect={handleSelectRegion}
                >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                            <div className='auto-complete-container'>
                                <label className='auto-complete-label' htmlFor='my-input'>Region :</label>
                                <input className='auto-complete-input' id='my-input' name='my-input' {...getInputProps({ placeholder: "Type Region" })} />
                            </div>
                            <div className='region-dropDown'>
                                {loading ? <div>...loading</div> : null}

                                {suggestions.map(suggestion => {
                                    const style = {
                                        backgroundColor: suggestion.active ? "#4895ef" : "#f4f4f4",
                                        color: suggestion.active ? "white" : "black",
                                    };

                                    return (
                                        <div className='dropDown-item' {...getSuggestionItemProps(suggestion, { style })}>
                                            {suggestion.description}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </PlacesAutocomplete>
                {/* // Image Upload */}
                <div className='image-range-selector'>
                    <label htmlFor='image'>Upload Images :</label>
                    <input id='image' type="file" multiple accept="image/*" className='range-selector from' name="image" onChange={imageHandler} />
                </div>
            </div>

            <div className='components'>
                {/* Image Viewer */}
                <div className='img-container' key={selectedFile}>
                    <img className='my-img' src={(selectedFile.length > 0) ? (imgCount >= selectedFile.length ? finalImage : selectedFile[imgCount]) : initialImage} alt='upload-images' />
                </div>

                {/* Form Data */}
                <div className='main-dataForm'>
                    {(imgCount < selectedFile.length)
                        && <>
                            {Array.from({ length: count }, (v, k) => (
                                <div className='content-div' key={k}>
                                    {/* Phone */}
                                    {myShops[k].phone.map((val, index) => (
                                        <div className='phone-el'>
                                            <label className='phone-label' htmlFor='phone'>{index + 1}. Phone No. :</label>
                                            <input type="text" maxLength='12' id={k} data-index={index} className='phone-input' name='phone' value={val} onChange={onChangeHandeler} onBlur={validatePhoneNumber} />
                                            {index === 0 ? <button className='add-phones' id={k} name='phone' onClick={phoneAppend}>+</button>
                                                :
                                                <button id={k} data-index={index} className='add-phones' name='phone' onClick={deletePhone}>-</button>
                                            }
                                        </div>
                                    ))}
                                    {error === 'Phone not valid' && <span className='show-error'>Phone number already exists, provide another or Click Next</span>}
                                    {/* Owner Name */}
                                    <div>
                                        <label className='ownerName-label' htmlFor='ownerName'>Owners Name : </label>
                                        <input type='text' id={k} className='ownerName-input' name='ownerName' value={myShops[k].ownerName} onChange={onChangeHandeler} />
                                    </div>
                                    {/* Shop Name */}
                                    <div>
                                        <label className='shopName-label' htmlFor='shopName'>Shop Name : </label>
                                        <input type='text' id={k} className='shopName-input' name='shopName' value={myShops[k].shopName} onChange={onChangeHandeler} />
                                    </div>
                                    {/* Category */}
                                    {myShops[k].category.map((val, index) => (
                                        <div className='category_div'>
                                            <label className='category-label' htmlFor='category'>{index + 1}. Category : </label>
                                            {/* <input type='text' id={k} data-index={index} className='category-input' name='category' onChange={onChangeHandeler} /> */}
                                            <select id={k} data-index={index} className='category-input' name='category' value={val} onChange={onChangeHandeler}>
                                                <option className='sub-options' value=''>
                                                    ----Select One----
                                                </option>
                                                {allCategories.map((value) => (
                                                    <>
                                                        <option className='main-options' disabled>
                                                            {value.title}
                                                        </option>
                                                        {value['sub-catgeories'].map((val) => (
                                                            <option className='sub-options' value={val.id}>
                                                                &emsp;{val.title}
                                                            </option>
                                                        ))}
                                                    </>
                                                ))}
                                            </select>
                                            {index === 0
                                                ? <button className='add-phones' id={k} name='category' onClick={phoneAppend}>+</button>
                                                : <button id={k} data-index={index} className='add-phones' name='category' onClick={deletePhone}>-</button>
                                            }
                                        </div>
                                    ))}
                                    {/* Address */}
                                    <div>
                                        <label className='address-label' htmlFor='address'>Address : </label>
                                        <input type='text' id={k} className='address-input' name='address' value={myShops[k].address} onChange={onChangeHandeler} />
                                    </div>
                                    {/* Email */}
                                    <div>
                                        <label className='email-label' htmlFor='email'>Email : </label>
                                        <input type='email' id={k} className='email-input' name='email' value={myShops[k].email} onChange={onChangeHandeler} />
                                    </div>
                                    {/* Save And Next */}
                                    <div className='delete-box'>
                                        <label className='shop-delet' htmlFor='delet'>Shop {k + 1}: </label>
                                        <button id={k} className='shop-delet-button' name='delet' onClick={deleteShop}>Delete</button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Shop  */}
                            <div className='Shop'>
                                <p className=''>Add a shop...</p>
                                <button onClick={shopDivAppend}>Add Shop</button>
                            </div>

                        </>}

                    {/* Show error */}
                    {error && (error !== 'Phone not valid') && <p className='show-error'>Please fill all {error}</p>}

                    {/* (Save and Next) and Subbmit Button */}
                    {(selectedFile.length > 0)
                        ? (imgCount >= selectedFile.length)
                            ? (allShops.length > 0) ? <button type='submit' className='submit-button' onClick={submitAllImages}>Submit</button> : <p className='show-error'>There are no changes to save please upload images again</p>
                            :
                            (<div className='save-next-button'>
                                <button type='submit' className='save-button next' onClick={nextNext}>Next</button>
                                {(error !== 'Phone not valid') && <button type='submit' className='save-button' onClick={saveAndNext}>Save and Next</button>}
                            </div>)
                        : null
                    }
                </div>
            </div>
        </>
    )
}

export default DataForm;
