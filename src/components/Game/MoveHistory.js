import React, {useState, useEffect} from 'react';

export default function MoveHistory({history}) {
    const [jsx, setJsx] = useState([]);

    useEffect(() => {
        let newJsx = [];
        let odd = true;
        for(let i=1; i<history.length; i+=2) {
            const key = `${history.length}-${i}`;
            newJsx.push(
                <div className={`row ${odd ? 'my-bg-light' : 'my-bg-dark'}`} key={key}>
                    <span className="col-2">{`${Math.ceil(i/2)}. `}</span>
                    <div className="col-5">{history[i-1]}</div>
                    <div className="col-5">{history[i]}</div>
                </div>
            );
            odd = !odd;
        }

        if(history.length % 2) {
            const key = `${history.length}-${history.length}`;
            newJsx.push(
                <div className={`row ${odd ? 'my-bg-light' : 'my-bg-dark'}`} key={key}>
                    <span className="col-2">{`${Math.ceil(history.length/2)}. `}</span>
                    <div className="col-5">{history[history.length-1]}</div>
                </div>
            );
        }

        setJsx(newJsx);

    }, [history])

    return (
        <div className="moves">
            {jsx}
        </div>
    )

}