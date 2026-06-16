"use client"
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { MdCalendarMonth } from "react-icons/md";
import { LuListTodo } from "react-icons/lu";
import { BiCalendarWeek } from "react-icons/bi";
import { FaMoneyBillWave } from "react-icons/fa";

import './addpage.css'

import { useRouter } from 'next/navigation';

export default function AddPage() {
    const router = useRouter();
    function navigationexpenes() {   
        router.push('/add/expenes')
    }
    function navigationincome() {   
        router.push('/add/Income')
    }
    function navigationmonthly() {   
        router.push('/add/monthly')
    }
function navigationweekly() {   
        router.push('/add/weekly')
    }
    function navigationtodo() {   
        router.push('/add/todo')
    }
    return (
        <>
            <div className="Main">
                <div className="addbtnContner">
                    <div onClick={navigationexpenes} className="addwrapper">
                        <h3 className="heading">expenses</h3>
                        <FaPlus />
                    </div>
                    <div className="addwrapper" onClick={navigationincome}>
                        <h3 className="heading">Income</h3>
                        <FaMinus />
                    </div>
                </div>
                <div className="monthlybtnContner" onClick={navigationmonthly}>
                    <div className="addwrapper">
                        <MdCalendarMonth />
                        <h3>Monthly expenses</h3>
                    </div>
                </div>
                <div className="weeklybtnContner"onClick={navigationweekly}>
                    <div className="addwrapper">
                        <BiCalendarWeek />
                        <h3>Weekly expenses</h3>
                    </div>
                </div>
                <div className="weeklybtnContner">
                    <div className="addwrapper" >
                        <BiCalendarWeek />
                        <h3>Daly expenses</h3>
                    </div>
                </div>
                <div className="weeklybtnContner" onClick={navigationtodo}>
                    <div className="todo">
                        <LuListTodo />
                        <h3>To Do</h3>
                    </div>
                </div>
            </div>

        </>
    )
}