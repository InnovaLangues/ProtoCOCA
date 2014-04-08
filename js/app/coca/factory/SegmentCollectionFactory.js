'use strict';



function SegmentCollectionFactory() {

    return{
        loadExistingProjects: function() {
            var segmentCollections = [];
            var fake = {
                id: '150062f4-2493-4b6c-8a94-7cdea51c248e',
                name: 'Wall Mart 1',
                fId: '3b12191e-4d98-4106-8f0d-3ae668ee7310',
                fUrl: 'media/Wal_mart.mp3',
                segments: [
                    {
                        id: '1709b040-1523-4d3d-9cf2-e8ecfcd34597',
                        fUrl: 'media/Wal_mart.mp3',
                        fId: '3b12191e-4d98-4106-8f0d-3ae668ee7310',
                        name: '0_Wal_mart',
                        start: '0',
                        mStartId: '2fa85301-932f-49d4-bace-3198acd14263',
                        end: '17.573877334594727',
                        mEndId: 'c331c99c-b176-44b4-94d4-f814183eb741'
                    },
                    {
                        id: '2305b4be-39bf-49d2-8b80-a9b98704a000',
                        fUrl: 'media/Wal_mart.mp3',
                        fId: '3b12191e-4d98-4106-8f0d-3ae668ee7310',
                        name: '1_Wal_mart',
                        start: '17.573877334594727',
                        mStartId: 'cfake.id331c99c-b176-44b4-94d4-f814183eb741',
                        end: '35.14775466918945',
                        mEndId: '6e75ed03-c5de-48d3-8898-6a7685601e62'
                    },
                    {
                        id: '26786e50-0d11-4ede-ad34-7b8f78665a4e',
                        fUrl: 'media/Wal_mart.mp3',
                        fId: '3b12191e-4d98-4106-8f0d-3ae668ee7310',
                        name: '2_Wal_mart',
                        start: '35.14775466918945',
                        mStartId: '6e75ed03-c5de-48d3-8898-6a7685601e62',
                        end: '52.72163200378418',
                        mEndId: '155305a4-7a1c-46ec-ae53-79f2a9193610'
                    },
                    {
                        id: '925f6791-2598-476e-a208-0ce275db0825',
                        fUrl: 'media/Wal_mart.mp3',
                        fId: '3b12191e-4d98-4106-8f0d-3ae668ee7310',
                        name: '3_Wal_mart',
                        start: '52.72163200378418',
                        mStartId: '155305a4-7a1c-46ec-ae53-79f2a9193610',
                        end: '70.2955093383789',
                        mEndId: 'dc4ff609-b5fc-4e97-aada-47604383d736'
                    }
                ]

            };
            segmentCollections.push(fake);
            return segmentCollections;

        }
    };
}


